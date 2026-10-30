export const PLATFORMS = ["doordash", "uber_eats", "grubhub"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const SOURCE_KINDS = ["pos", "delivery", "bank"] as const;
export type SourceKind = (typeof SOURCE_KINDS)[number];

export const MATCH_STATUSES = [
  "matched",
  "unpaid_cancellation",
  "short_pay",
  "fee_error",
  "unmatched_refund",
  "unmatched_pos",
  "unmatched_delivery",
  "deposit_short",
] as const;
export type MatchStatus = (typeof MATCH_STATUSES)[number];

export const RUN_STATUSES = ["draft", "complete"] as const;
export type RunStatus = (typeof RUN_STATUSES)[number];

export const DISPUTE_STATUSES = [
  "draft",
  "ready",
  "sent",
  "awaiting",
  "approved",
  "denied",
  "closed",
] as const;
export type DisputeStatus = (typeof DISPUTE_STATUSES)[number];

export type Location = {
  id: string;
  name: string;
  storeNumber: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  billingActive: boolean;
};

export type Source = {
  id: string;
  locationId: string;
  kind: SourceKind;
  label: string;
  platform?: Platform;
  commissionBps?: number;
  maskedCredential: string;
  connected: boolean;
  supportEmail?: string;
};

export type PosOrder = {
  id: string;
  locationId: string;
  ticketId: string;
  platformOrderId: string;
  ticketAt: string;
  grossCents: number;
  status: "completed" | "voided" | "refunded";
};

export type DeliveryItem = {
  id: string;
  locationId: string;
  platform: Platform;
  orderId: string;
  payoutItemId: string;
  payoutBatchId: string;
  soldAt: string;
  grossCents: number;
  commissionCents: number;
  adjustmentCents: number;
  netCents: number;
  status: "paid" | "canceled" | "refunded" | "adjusted";
  adjustmentReason: string;
};

export type BankDeposit = {
  id: string;
  locationId: string;
  platform: Platform;
  payoutBatchId: string;
  postedOn: string;
  amountCents: number;
  maskedAccount: string;
  memo: string;
};

export type MatchRecord = {
  id: string;
  runId: string;
  locationId: string;
  platform: Platform | "bank";
  posOrderId?: string;
  deliveryItemId?: string;
  bankDepositId?: string;
  status: MatchStatus;
  expectedCents: number;
  receivedCents: number;
  varianceCents: number;
  recoveredCents: number;
  summary: string;
  disputeText: string;
};

export type ReconciliationRun = {
  id: string;
  locationId: string;
  periodStart: string;
  periodEnd: string;
  status: RunStatus;
  netVarianceCents: number;
  createdAt: string;
};

export type Dispute = {
  id: string;
  matchId: string;
  runId: string;
  locationId: string;
  status: DisputeStatus;
  subject: string;
  body: string;
  toEmail: string;
  updatedAt: string;
};

export type WaitlistEntry = {
  id: string;
  email: string;
  restaurant: string;
  createdAt: string;
};

export type ContactProfile = {
  name: string;
  title: string;
  phone: string;
  email: string;
};

export type Workspace = {
  version: 2;
  ownerId: string;
  contact: ContactProfile;
  locations: Location[];
  sources: Source[];
  posOrders: PosOrder[];
  deliveryItems: DeliveryItem[];
  bankDeposits: BankDeposit[];
  runs: ReconciliationRun[];
  matches: MatchRecord[];
  disputes: Dispute[];
  waitlist: WaitlistEntry[];
};

export const EMPTY_CONTACT: ContactProfile = {
  name: "",
  title: "",
  phone: "",
  email: "",
};

export const EMPTY_WORKSPACE: Workspace = {
  version: 2,
  ownerId: "demo",
  contact: EMPTY_CONTACT,
  locations: [],
  sources: [],
  posOrders: [],
  deliveryItems: [],
  bankDeposits: [],
  runs: [],
  matches: [],
  disputes: [],
  waitlist: [],
};

export function platformLabel(platform: Platform | "bank"): string {
  if (platform === "doordash") return "DoorDash";
  if (platform === "uber_eats") return "Uber Eats";
  if (platform === "grubhub") return "Grubhub";
  return "Bank";
}

export function matchStatusLabel(status: MatchStatus): string {
  switch (status) {
    case "matched":
      return "Matched";
    case "unpaid_cancellation":
      return "Unpaid cancellation";
    case "short_pay":
      return "Short pay";
    case "fee_error":
      return "Fee error";
    case "unmatched_refund":
      return "Unmatched refund";
    case "unmatched_pos":
      return "Missing on delivery";
    case "unmatched_delivery":
      return "Missing on POS";
    case "deposit_short":
      return "Deposit short";
  }
}

export function disputeStatusLabel(status: DisputeStatus): string {
  switch (status) {
    case "draft":
      return "Draft";
    case "ready":
      return "Ready to send";
    case "sent":
      return "Sent";
    case "awaiting":
      return "Awaiting response";
    case "approved":
      return "Refund received";
    case "denied":
      return "Refund denied";
    case "closed":
      return "Closed";
  }
}

export function formatStoreLine(location: Location): string {
  return `${location.city} — Store #${location.storeNumber}`;
}

export function formatStoreAddress(location: Location): string {
  return `${location.address}, ${location.city}, ${location.state} ${location.postalCode}`;
}
