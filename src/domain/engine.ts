import { buildDisputeText } from "@/domain/disputes";
import { centsVariance, formatCents } from "@/domain/money";
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
    return classifyPayoutOnly(delivery);
  }

  if (!pos || !delivery) {
    throw new Error("classifyOrder requires at least one side.");
  }

  const bps = commissionBpsFor(sources, delivery.platform);
  const expectedCommissionCents = expectedCommission(pos.grossCents, bps);
  const expectedCents = pos.grossCents - expectedCommissionCents;
  const receivedCents = Math.max(delivery.netCents, 0);
  const shortCents = expectedCents - receivedCents;

  if (delivery.status === "canceled" && pos.status === "completed") {
    if (shortCents <= 1) {
      return {
        status: "matched" as const,
        expectedCents,
        receivedCents,
        summary: `Order ${delivery.orderId} was marked canceled, but the payout still covered expected net.`,
      };
    }
    return {
      status: "unpaid_cancellation" as const,
      expectedCents: pos.grossCents,
      receivedCents,
      summary: `Food was sold on POS, then ${delivery.orderId} was canceled. Still owed ${formatCents(pos.grossCents - receivedCents)}.`,
    };
  }

  if (delivery.status === "refunded" && pos.status === "completed") {
    if (shortCents <= 1) {
      return {
        status: "matched" as const,
        expectedCents,
        receivedCents,
        summary: `Refund language on ${delivery.orderId}, but expected net still landed.`,
      };
    }
    return {
      status: "unmatched_refund" as const,
      expectedCents,
      receivedCents,
      summary: `Refund posted on the payout while POS ticket ${pos.ticketId} stayed completed. Still owed ${formatCents(shortCents)}.`,
    };
  }

  if (shortCents <= 1) {
    return {
      status: "matched" as const,
      expectedCents,
      receivedCents,
      summary: `Order ${delivery.orderId} matched POS and payout. Extra on the line is ignored.`,
    };
  }

  const commissionDelta = Math.abs(delivery.commissionCents - expectedCommissionCents);
  if (commissionDelta > 100) {
    return {
      status: "fee_error" as const,
      expectedCents,
      receivedCents,
      summary: `Commission on ${delivery.orderId} is ${formatCents(delivery.commissionCents)} vs contracted ${formatCents(expectedCommissionCents)}.`,
    };
  }

  return {
    status: "short_pay" as const,
    expectedCents,
    receivedCents,
    summary: `Payout for ${delivery.orderId} is short ${formatCents(shortCents)}.`,
  };
}

function expectedNetCents(delivery: DeliveryItem) {
  return Math.max(delivery.grossCents - delivery.commissionCents, 0);
}

function takeCents(delivery: DeliveryItem) {
  if (delivery.adjustmentCents < 0) {
    return -delivery.adjustmentCents;
  }
  if (delivery.netCents < 0) {
    return -delivery.netCents;
  }
  return 0;
}

function isCleanPayout(delivery: DeliveryItem) {
  const hay = `${delivery.status} ${delivery.adjustmentReason}`.toLowerCase();
  if (delivery.netCents < 0 || delivery.adjustmentCents < 0) {
    return false;
  }
  if (delivery.status === "canceled" || delivery.status === "refunded") {
    return false;
  }
  if (/undeliver|cancel|refund|error charge|clawback|missing|never arrived|late report/.test(hay)) {
    return delivery.netCents >= expectedNetCents(delivery) - 1;
  }
  return delivery.netCents >= expectedNetCents(delivery) - 1;
}

function merchantOwed(expectedCents: number, receivedCents: number) {
  return expectedCents - receivedCents > 1;
}

function classifyPayoutOnly(delivery: DeliveryItem) {
  const hay = `${delivery.status} ${delivery.adjustmentReason}`.toLowerCase();
  const missingItem = /missing item|didn't receive all|incomplete order/.test(hay);
  const expectedFromSale = expectedNetCents(delivery);
  const taken = takeCents(delivery);
  const paid = Math.max(delivery.netCents, 0);

  if (delivery.status === "canceled" || /undeliver|never arrived|not delivered/.test(hay)) {
    const expectedCents = expectedFromSale || taken || delivery.grossCents;
    const receivedCents = paid;
    if (!merchantOwed(expectedCents, receivedCents)) {
      return {
        status: "matched" as const,
        expectedCents,
        receivedCents,
        summary: `Cancel language on ${delivery.orderId}, but the payout was not short.`,
      };
    }
    return {
      status: "unpaid_cancellation" as const,
      expectedCents,
      receivedCents,
      summary: /late report/.test(hay)
        ? `Late report on ${delivery.orderId} took ${formatCents(expectedCents - receivedCents)}. Platforms usually reverse these.`
        : `Payout marked undelivered/canceled on ${delivery.orderId}. Still owed ${formatCents(expectedCents - receivedCents)}.`,
    };
  }

  if (taken > 0 || delivery.status === "refunded" || delivery.netCents < 0) {
    const expectedCents = Math.max(expectedFromSale, taken);
    const receivedCents = delivery.netCents < 0 ? 0 : paid;
    if (!merchantOwed(expectedCents, receivedCents)) {
      return {
        status: "matched" as const,
        expectedCents,
        receivedCents,
        summary: `Adjustment on ${delivery.orderId} did not leave the store short.`,
      };
    }
    return {
      status: "unmatched_refund" as const,
      expectedCents,
      receivedCents,
      summary: missingItem
        ? `Missing-item clawback on ${delivery.orderId} for ${formatCents(expectedCents - receivedCents)}. Letter is drafted — they usually want a bag photo.`
        : `Error charge / deduction on ${delivery.orderId} took ${formatCents(expectedCents - receivedCents)}.`,
    };
  }

  if (merchantOwed(expectedFromSale, paid)) {
    return {
      status: "short_pay" as const,
      expectedCents: expectedFromSale,
      receivedCents: paid,
      summary: `Payout for ${delivery.orderId} is short ${formatCents(expectedFromSale - paid)}.`,
    };
  }

  return {
    status: "matched" as const,
    expectedCents: expectedFromSale,
    receivedCents: paid,
    summary: `Payout line ${delivery.orderId} is not short.`,
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
  const payoutOnly = input.posOrders.length === 0;

  for (const pos of input.posOrders) {
    const delivery = input.deliveryItems.find(
      (item) => item.orderId === pos.platformOrderId,
    );
    if (delivery) {
      usedDelivery.add(delivery.id);
    }

    const classified = classifyOrder(pos, delivery, input.sources);
    const status =
      merchantOwed(classified.expectedCents, classified.receivedCents) ? classified.status : "matched";
    const record: MatchRecord = {
      id: id("mch"),
      runId: input.runId,
      locationId: input.locationId,
      platform: delivery?.platform ?? inferPlatform(pos.platformOrderId),
      posOrderId: pos.id,
      deliveryItemId: delivery?.id,
      status,
      expectedCents: classified.expectedCents,
      receivedCents: classified.receivedCents,
      recoveredCents: 0,
      recoveryEvidence: "none",
      varianceCents: centsVariance(classified.receivedCents, classified.expectedCents),
      summary: classified.summary,
      disputeText: "",
    };
    if (status !== "matched") {
      record.disputeText = buildDisputeText({
        match: record,
        pos,
        delivery,
        location: input.location,
        contact: input.contact,
      });
    }
    matches.push(record);
  }

  for (const delivery of input.deliveryItems) {
    if (usedDelivery.has(delivery.id)) {
      continue;
    }
    const classified =
      payoutOnly && isCleanPayout(delivery)
        ? {
            status: "matched" as const,
            expectedCents: expectedNetCents(delivery),
            receivedCents: Math.max(delivery.netCents, 0),
            summary: `Payout line ${delivery.orderId} paid as expected.`,
          }
        : classifyOrder(undefined, delivery, input.sources);
    const status =
      classified.status === "matched" || !merchantOwed(classified.expectedCents, classified.receivedCents)
        ? "matched"
        : classified.status;
    const record: MatchRecord = {
      id: id("mch"),
      runId: input.runId,
      locationId: input.locationId,
      platform: delivery.platform,
      deliveryItemId: delivery.id,
      status,
      expectedCents: classified.expectedCents,
      receivedCents: classified.receivedCents,
      recoveredCents: 0,
      recoveryEvidence: "none",
      varianceCents: centsVariance(classified.receivedCents, classified.expectedCents),
      summary: classified.summary,
      disputeText: "",
    };
    if (status !== "matched") {
      record.disputeText = buildDisputeText({
        match: record,
        delivery,
        location: input.location,
        contact: input.contact,
      });
    }
    matches.push(record);
  }

  if (input.bankDeposits.length === 0) {
    return matches;
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
    const status = batch.received + 1 >= batch.expected ? "matched" : "deposit_short";
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
      recoveryEvidence: "none",
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
