import { formatCents } from "@/domain/money";
import type {
  ContactProfile,
  DeliveryItem,
  Location,
  MatchRecord,
  PosOrder,
  Source,
} from "@/domain/types";
import { formatStoreAddress, formatStoreLine, platformLabel } from "@/domain/types";

const CONTACT_TOKENS = {
  name: ["[Your name]", "[Name]"],
  title: ["[Your title]", "[Title]"],
  phone: ["[Phone]", "[Phone number]"],
  email: ["[Merchant account email]"],
} as const;

export function letterBlanks(text: string): string[] {
  return [...new Set(text.match(/\[[^\]]+\]/g) ?? [])];
}

export function hasLetterBlanks(text: string): boolean {
  return letterBlanks(text).length > 0;
}

function contactLine(value: string | undefined, fallback: string): string {
  const filled = value?.trim();
  return filled || fallback;
}

const SIGNATURE_MARK = /\nThank you,\s*\n[\s\S]*$/i;

export function stripSignature(body: string): string {
  return body.replace(SIGNATURE_MARK, "").trimEnd();
}

export function signatureBlock(contact: ContactProfile, businessName: string): string {
  return [
    "Thank you,",
    contactLine(contact.name, "[Your name]"),
    contactLine(contact.title, "[Your title]"),
    businessName.trim() || "[Business name]",
    contactLine(contact.phone, "[Phone]"),
    contactLine(contact.email, "[Merchant account email]"),
  ].join("\n");
}

export function stampSignature(
  body: string,
  contact: ContactProfile,
  businessName: string,
): string {
  return `${stripSignature(body)}\n\n${signatureBlock(contact, businessName)}`;
}

export function applyContactToLetter(
  body: string,
  contact: ContactProfile,
  businessName = "",
): string {
  let next = body;
  const replacements: Array<[readonly string[], string]> = [
    [CONTACT_TOKENS.name, contact.name],
    [CONTACT_TOKENS.title, contact.title],
    [CONTACT_TOKENS.phone, contact.phone],
    [CONTACT_TOKENS.email, contact.email],
  ];
  for (const [tokens, value] of replacements) {
    const filled = value.trim();
    if (!filled) continue;
    for (const token of tokens) {
      next = next.replaceAll(token, filled);
    }
  }
  return stampSignature(next, contact, businessName);
}

function subjectLine(body: string): string {
  const first = body.split("\n")[0] ?? "Reconciliation follow-up";
  return first.replace(/^Subject:\s*/i, "").trim();
}

export function supportEmailFor(
  sources: Source[],
  platform: MatchRecord["platform"],
): string {
  if (platform === "bank") {
    return sources.find((source) => source.kind === "bank")?.supportEmail ?? "";
  }
  return (
    sources.find((source) => source.kind === "delivery" && source.platform === platform)
      ?.supportEmail ?? ""
  );
}

function deskName(platform: MatchRecord["platform"]): string {
  if (platform === "uber_eats") return "Uber Eats Restaurant Support";
  if (platform === "grubhub") return "Grubhub Partner Support";
  if (platform === "bank") return "Payout Support";
  return "DoorDash Merchant Support";
}

function niceDate(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso.slice(0, 10);
  }
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function discrepancyLabel(status: MatchRecord["status"]): string {
  switch (status) {
    case "unpaid_cancellation":
      return "Unpaid cancellation";
    case "short_pay":
      return "Short pay";
    case "fee_error":
      return "Fee error";
    case "unmatched_refund":
      return "Unmatched refund";
    case "deposit_short":
      return "Deposit short";
    default:
      return "Reconciliation follow-up";
  }
}

function owedCents(match: Pick<MatchRecord, "expectedCents" | "receivedCents" | "varianceCents">) {
  return Math.max(match.expectedCents - match.receivedCents, Math.abs(match.varianceCents), 0);
}

function story(input: {
  match: Pick<
    MatchRecord,
    "status" | "expectedCents" | "receivedCents" | "varianceCents" | "platform"
  >;
  pos?: PosOrder;
  delivery?: DeliveryItem;
  platform: string;
  ticketId: string;
}): string {
  const expected = formatCents(input.match.expectedCents);
  const received = formatCents(input.match.receivedCents);
  const amount = formatCents(owedCents(input.match));
  const ticket = input.ticketId;
  const orderId = input.delivery?.orderId ?? "this order";
  const reason = input.delivery?.adjustmentReason?.trim();
  const reasonBit = reason ? ` Payout note: “${reason}.”` : "";

  if (input.match.status === "unpaid_cancellation") {
    if (!input.pos) {
      return [
        `${input.platform} order ${orderId} was marked canceled or undelivered.${reasonBit}`,
        `If a marketplace courier took the food, transport is not the restaurant’s liability.`,
        `This line should have paid ${expected}. It paid ${received}. ${amount} is still owed.`,
        `Please reverse the deduction per merchant transport policy, or send the proof that the restaurant caused a never-arrived.`,
      ].join(" ");
    }
    return [
      `POS ticket ${ticket} was completed and the food was prepared.`,
      `${input.platform} later marked ${orderId} as canceled.${reasonBit}`,
      `Expected payment ${expected}. Payout paid ${received}. Please reverse the ${amount} take, or pay the completed ticket.`,
    ].join(" ");
  }

  if (input.match.status === "fee_error") {
    return [
      `Commission on ${orderId} does not match the contracted rate.${reasonBit}`,
      `Expected net ${expected}. Received ${received}. Please reverse the ${amount} fee error.`,
    ].join(" ");
  }

  if (input.match.status === "short_pay") {
    return [
      `${input.platform} underpaid ${orderId}.${reasonBit}`,
      `Expected net ${expected} after marketplace commission. Received ${received}.`,
      `Please reverse the ${amount} shortfall, or show the adjustment that explains it.`,
    ].join(" ");
  }

  if (input.match.status === "unmatched_refund") {
    const missingItem = /missing item|didn't receive all|incomplete order/i.test(reason ?? "");
    if (!input.pos) {
      return [
        `${input.platform} posted ${missingItem ? "a missing-item clawback" : "a refund / error charge"} on ${orderId}.${reasonBit}`,
        `Expected ${expected}. This line paid ${received}. Restore ${amount}.`,
        missingItem
          ? `If this is a missing-item claim, reverse the take unless you have item-level proof. A customer note is not enough.`
          : `Please send the authorization that supports this clawback, or restore the funds.`,
      ].join(" ");
    }
    return [
      `A ${missingItem ? "missing-item clawback" : "refund / error charge"} hit ${orderId}, but POS ticket ${ticket} is still completed.${reasonBit}`,
      `Expected ${expected}. Received ${received}. Please restore ${amount}, or provide the matching refund authorization.`,
    ].join(" ");
  }

  if (input.match.status === "deposit_short") {
    return [
      `The payout batch expected ${expected} to land in the restaurant account.`,
      `The bank deposit received was ${received}.`,
      `Please confirm the missing ${amount} transfer or the offsetting adjustment.`,
    ].join(" ");
  }

  return `Expected ${expected}, received ${received}. Please review this line and issue any amount still due.`;
}

export function buildDisputeText(input: {
  match: Pick<
    MatchRecord,
    "status" | "expectedCents" | "receivedCents" | "varianceCents" | "platform"
  >;
  pos?: PosOrder;
  delivery?: DeliveryItem;
  location?: Location;
  contact?: ContactProfile;
}): string {
  const platformKey = input.match.platform;
  const platform = platformLabel(platformKey === "bank" ? "doordash" : platformKey);
  const orderId = input.delivery?.orderId ?? input.pos?.platformOrderId ?? "unknown";
  const ticketId = input.pos?.ticketId ?? "n/a";
  const amount = formatCents(owedCents(input.match));
  const storeName = input.location?.name ?? "[Business name]";
  const kind = discrepancyLabel(input.match.status);
  const orderDate = niceDate(input.delivery?.soldAt ?? input.pos?.ticketAt);

  const facts = [
    input.location ? `Store: ${storeName} (${formatStoreLine(input.location)})` : "Store: [Business name]",
    input.location ? `Address: ${formatStoreAddress(input.location)}` : null,
    `Platform: ${platform}`,
    `Order ID: ${orderId}`,
    input.delivery?.payoutBatchId ? `Payout: ${input.delivery.payoutBatchId}` : null,
    orderDate ? `Order date: ${orderDate}` : null,
  ].filter((line): line is string => Boolean(line));

  const evidence = [
    ticketId !== "n/a" ? `- POS ticket ${ticketId} (${input.pos?.status ?? "on file"})` : null,
    input.delivery?.orderId
      ? `- ${platform} order ${input.delivery.orderId}${input.delivery.payoutItemId ? ` / payout item ${input.delivery.payoutItemId}` : ""}`
      : null,
    input.delivery?.payoutBatchId ? `- Payout batch ${input.delivery.payoutBatchId}` : null,
    input.delivery?.adjustmentReason
      ? `- Reported adjustment: ${input.delivery.adjustmentReason}`
      : null,
    `- Disputed amount ${amount} from payout records${ticketId !== "n/a" ? ", POS, and bank where provided" : ""}`,
  ].filter((line): line is string => Boolean(line));

  const portal =
    platformKey === "bank"
      ? "If your bank already shows a matching credit, please include that confirmation."
      : `If ${platform} has an in-portal dispute for this transaction, please file there first. This letter is the saved evidence package and can be used as an escalation.`;

  return [
    `Subject: Dispute request — ${kind} — ${platform} order ${orderId}`,
    "",
    `Hello ${deskName(platformKey)},`,
    "",
    `I am requesting a review of ${/^[aeiou]/i.test(kind) ? "an" : "a"} ${kind.toLowerCase()} for ${amount} on the order below.`,
    "",
    ...facts,
    "",
    story({
      match: input.match,
      pos: input.pos,
      delivery: input.delivery,
      platform,
      ticketId,
    }),
    "",
    portal,
    "",
    `Discrepancy type: ${kind}`,
    `Disputed amount: ${amount}`,
    `POS ticket: ${ticketId}`,
    `Marketplace order: ${orderId}`,
    "",
    "Evidence on file:",
    ...evidence,
    "",
    signatureBlock(input.contact ?? { name: "", title: "", phone: "", email: "" }, storeName),
  ].join("\n");
}

export function disputeSubject(body: string): string {
  return subjectLine(body);
}
