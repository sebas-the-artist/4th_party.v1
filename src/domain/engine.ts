import { buildDisputeText } from "@/domain/disputes";
import { centsVariance } from "@/domain/money";
import type {
  BankDeposit,
  ContactProfile,
  DeliveryItem,
  Location,
  MatchRecord,
  Platform,
  PosOrder,
  Source,
} from "@/domain/types";

function id(prefix: string) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

function commissionBpsFor(sources: Source[], platform: Platform): number {
  return (
    sources.find((source) => source.kind === "delivery" && source.platform === platform)
      ?.commissionBps ?? 2500
  );
}

function expectedCommission(grossCents: number, bps: number): number {
  return Math.round((grossCents * bps) / 10000);
}

function classifyOrder(
  pos: PosOrder | undefined,
  delivery: DeliveryItem | undefined,
  sources: Source[],
) {
  if (pos && !delivery) {
    return {
      status: "unmatched_pos" as const,
      expectedCents: pos.grossCents,
      receivedCents: 0,
      summary: `POS ticket ${pos.ticketId} never appeared on the delivery payout.`,
    };
  }

  if (delivery && !pos) {
    return {
      status: "unmatched_delivery" as const,
      expectedCents: 0,
      receivedCents: delivery.netCents,
      summary: `Delivery order ${delivery.orderId} has no matching POS ticket.`,
    };
  }

  if (!pos || !delivery) {
    throw new Error("classifyOrder requires at least one side.");
  }

  const bps = commissionBpsFor(sources, delivery.platform);
  const expectedCommissionCents = expectedCommission(pos.grossCents, bps);
  const expectedCents = pos.grossCents - expectedCommissionCents;
  const receivedCents = delivery.netCents;
  const varianceCents = centsVariance(receivedCents, expectedCents);

  if (delivery.status === "canceled" && pos.status === "completed") {
    return {
      status: "unpaid_cancellation" as const,
      expectedCents: pos.grossCents,
      receivedCents,
      summary: `Food was sold on POS, then ${delivery.orderId} was canceled unpaid.`,
    };
  }

  if (delivery.status === "refunded" && pos.status === "completed") {
    return {
      status: "unmatched_refund" as const,
      expectedCents,
      receivedCents,
      summary: `Refund posted on the payout while POS ticket ${pos.ticketId} stayed completed.`,
    };
  }

  if (Math.abs(varianceCents) <= 1) {
    return {
      status: "matched" as const,
      expectedCents,
      receivedCents,
      summary: `Order ${delivery.orderId} matched POS, payout, and expected net.`,
    };
  }

  const commissionDelta = Math.abs(delivery.commissionCents - expectedCommissionCents);
  if (commissionDelta > 100) {
    return {
      status: "fee_error" as const,
      expectedCents,
      receivedCents,
      summary: `Commission on ${delivery.orderId} is ${delivery.commissionCents} cents vs contracted ${expectedCommissionCents}.`,
    };
  }

  return {
    status: "short_pay" as const,
    expectedCents,
    receivedCents,
    summary: `Payout for ${delivery.orderId} is short ${Math.abs(varianceCents)} cents.`,
  };
}

export function runMatchingEngine(input: {
  runId: string;
  locationId: string;
  location?: Location;
  contact?: ContactProfile;
  sources: Source[];
  posOrders: PosOrder[];
  deliveryItems: DeliveryItem[];
  bankDeposits: BankDeposit[];
}): MatchRecord[] {
  const matches: MatchRecord[] = [];
  const usedDelivery = new Set<string>();

  for (const pos of input.posOrders) {
    const delivery = input.deliveryItems.find(
      (item) => item.orderId === pos.platformOrderId,
    );
    if (delivery) {
      usedDelivery.add(delivery.id);
    }

    const classified = classifyOrder(pos, delivery, input.sources);
    const record: MatchRecord = {
      id: id("mch"),
      runId: input.runId,
      locationId: input.locationId,
      platform: delivery?.platform ?? inferPlatform(pos.platformOrderId),
      posOrderId: pos.id,
      deliveryItemId: delivery?.id,
      status: classified.status,
      expectedCents: classified.expectedCents,
      receivedCents: classified.receivedCents,
      recoveredCents: 0,
      varianceCents: centsVariance(classified.receivedCents, classified.expectedCents),
      summary: classified.summary,
      disputeText: "",
    };
    record.disputeText = buildDisputeText({
      match: record,
      pos,
      delivery,
      location: input.location,
      contact: input.contact,
    });
    matches.push(record);
  }

  for (const delivery of input.deliveryItems) {
    if (usedDelivery.has(delivery.id)) {
      continue;
    }
    const classified = classifyOrder(undefined, delivery, input.sources);
    const record: MatchRecord = {
      id: id("mch"),
      runId: input.runId,
      locationId: input.locationId,
      platform: delivery.platform,
      deliveryItemId: delivery.id,
      status: classified.status,
      expectedCents: classified.expectedCents,
      receivedCents: classified.receivedCents,
      recoveredCents: 0,
      varianceCents: centsVariance(classified.receivedCents, classified.expectedCents),
      summary: classified.summary,
      disputeText: "",
    };
    record.disputeText = buildDisputeText({
      match: record,
      delivery,
      location: input.location,
      contact: input.contact,
    });
    matches.push(record);
  }

  const batches = new Map<string, { platform: Platform; expected: number; received: number; deposit?: BankDeposit }>();

  for (const item of input.deliveryItems) {
    const current = batches.get(item.payoutBatchId) ?? {
      platform: item.platform,
      expected: 0,
      received: 0,
    };
    current.expected += item.netCents;
    batches.set(item.payoutBatchId, current);
  }

  for (const deposit of input.bankDeposits) {
    const current = batches.get(deposit.payoutBatchId) ?? {
      platform: deposit.platform,
      expected: 0,
      received: 0,
    };
    current.received += deposit.amountCents;
    current.deposit = deposit;
    batches.set(deposit.payoutBatchId, current);
  }

  for (const [batchId, batch] of batches) {
    const varianceCents = centsVariance(batch.received, batch.expected);
    const status = Math.abs(varianceCents) <= 1 ? "matched" : "deposit_short";
    const record: MatchRecord = {
      id: id("mch"),
      runId: input.runId,
      locationId: input.locationId,
      platform: "bank",
      bankDepositId: batch.deposit?.id,
      status,
      expectedCents: batch.expected,
      receivedCents: batch.received,
      recoveredCents: 0,
      varianceCents,
      summary:
        status === "matched"
          ? `Bank deposit for ${batchId} matches the payout batch.`
          : `Bank deposit for ${batchId} is short of the payout batch.`,
      disputeText: "",
    };
    record.disputeText = buildDisputeText({
      match: record,
      location: input.location,
      contact: input.contact,
    });
    matches.push(record);
  }

  return matches;
}

function inferPlatform(orderId: string): Platform {
  const id = orderId.toUpperCase();
  if (id.startsWith("UE")) return "uber_eats";
  if (id.startsWith("GH")) return "grubhub";
  return "doordash";
}
