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
  const amount = formatCents(Math.abs(input.match.varianceCents));
  const ticket = input.ticketId;

  if (input.match.status === "unpaid_cancellation") {
    return [
      `The POS ticket ${ticket} was completed and the order was prepared.`,
      `${input.platform} later marked the order as canceled.`,
      `The payout for this order was ${received}; expected payment was ${expected}.`,
      `Please review and reverse the ${amount} deduction, or issue the appropriate payment for the completed order.`,
    ].join(" ");
  }

  if (input.match.status === "short_pay" || input.match.status === "fee_error") {
    return [
      `Expected net ${expected}. Received ${received}.`,
      `Please review the commission and adjustments on this order and reverse the ${amount} shortfall, or issue the appropriate payment.`,
    ].join(" ");
  }

  if (input.match.status === "unmatched_refund") {
    return [
      `A refund or clawback hit the payout, but POS ticket ${ticket} is still completed.`,
      `Please review and restore ${amount}, or provide the matching refund authorization.`,
    ].join(" ");
  }

  if (input.match.status === "deposit_short") {
    return [
      `The payout batch expected ${expected} to land in the restaurant account.`,
      `The bank deposit received was ${received}.`,
      `Please review and confirm the missing transfer or the offsetting adjustment.`,
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
  const amount = formatCents(Math.abs(input.match.varianceCents));
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
    `- Disputed amount ${amount} from POS, payout, and bank records`,
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
    `I am requesting a review of ${/^[aeiou]/i.test(kind) ? "an" : "a"} ${kind.toLowerCase()} on the order below.`,
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
