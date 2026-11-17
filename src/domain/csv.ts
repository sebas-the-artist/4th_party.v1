import { dollarsToCents } from "@/domain/money";
import type { BankDeposit, DeliveryItem, Platform, PosOrder } from "@/domain/types";

export function parseRows(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  const text = csv.replace(/^\uFEFF/, "");

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }

    if (ch === ",") {
      row.push(cell.trim());
      cell = "";
      continue;
    }

    if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && next === "\n") {
        i += 1;
      }
      row.push(cell.trim());
      cell = "";
      if (row.some((value) => value.length > 0)) {
        rows.push(row);
      }
      row = [];
      continue;
    }

    cell += ch;
  }

  row.push(cell.trim());
  if (row.some((value) => value.length > 0)) {
    rows.push(row);
  }
  return rows;
}

function normHeader(name: string) {
  return name
    .toLowerCase()
    .replace(/[#]/g, " number ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function pickColumn(header: string[], aliases: string[]): number {
  const norms = header.map(normHeader);
  const wanted = aliases.map(normHeader);
  for (const alias of wanted) {
    const exact = norms.indexOf(alias);
    if (exact >= 0) {
      return exact;
    }
  }
  for (const alias of wanted) {
    const fuzzy = norms.findIndex(
      (name) => name.includes(alias) || alias.includes(name),
    );
    if (fuzzy >= 0 && alias.length >= 3) {
      return fuzzy;
    }
  }
  return -1;
}

function requireColumn(header: string[], aliases: string[], label: string) {
  const index = pickColumn(header, aliases);
  if (index === -1) {
    throw new Error(`Need a ${label} column. We looked for: ${aliases.slice(0, 6).join(", ")}.`);
  }
  return index;
}

function cell(row: string[], index: number) {
  if (index < 0) {
    return "";
  }
  return row[index] ?? "";
}

function parseCentsCell(value: string, field: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "-" || trimmed === "—") {
    return 0;
  }
  const paren = trimmed.match(/^\((.+)\)$/);
  const raw = (paren ? `-${paren[1]}` : trimmed).replace(/[()]/g, "");
  try {
    return dollarsToCents(raw);
  } catch {
    throw new Error(`${field} is not a valid amount (${value}).`);
  }
}

function platformFromOrder(orderId: string, fallback: Platform): Platform {
  const id = orderId.toUpperCase();
  if (id.startsWith("UE")) return "uber_eats";
  if (id.startsWith("GH")) return "grubhub";
  if (id.startsWith("DD")) return "doordash";
  return fallback;
}

function guessPlatform(value: string, fallback: Platform): Platform {
  if (!value.trim()) {
    return fallback;
  }
  try {
    return parsePlatform(value);
  } catch {
    return fallback;
  }
}

function deliveryStatus(type: string, reason: string): DeliveryItem["status"] {
  const hay = `${type} ${reason}`.toLowerCase();
  if (/cancel|undeliver|never arrived|not delivered|did not deliver/.test(hay)) {
    return "canceled";
  }
  if (/refund|error charge|clawback|chargeback/.test(hay)) {
    return "refunded";
  }
  if (/adjust/.test(hay)) {
    return "adjusted";
  }
  if (/paid|delivery|completed|delivered|payout/.test(hay) || !hay.trim()) {
    return "paid";
  }
  return "adjusted";
}

function posStatus(value: string): PosOrder["status"] {
  const hay = value.toLowerCase();
  if (/void/.test(hay)) return "voided";
  if (/refund/.test(hay)) return "refunded";
  return "completed";
}

function maybeLateReport(soldAt: string, reportedAt: string, reason: string) {
  if (!soldAt || !reportedAt) {
    return reason;
  }
  const sold = Date.parse(soldAt);
  const reported = Date.parse(reportedAt);
  if (Number.isNaN(sold) || Number.isNaN(reported)) {
    return reason;
  }
  if (reported - sold > 96 * 60 * 60 * 1000) {
    const note = "Late customer report (>96 hours).";
    return reason ? `${note} ${reason}` : note;
  }
  return reason;
}

export function parsePlatform(value: string): Platform {
  const key = value.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (key === "uber_eats" || key === "uber" || key === "ubereats") {
    return "uber_eats";
  }
  if (key === "grubhub" || key === "grub_hub") {
    return "grubhub";
  }
  if (key === "doordash" || key === "door_dash" || key === "dd") {
    return "doordash";
  }
  throw new Error(`Unknown platform "${value}". Use doordash, uber_eats, or grubhub.`);
}

export function parsePosCsv(csv: string, locationId: string): PosOrder[] {
  const text = csv.trim();
  if (!text) {
    return [];
  }
  const [header, ...rows] = parseRows(text);
  if (!header) {
    return [];
  }

  const ticketId = requireColumn(
    header,
    ["ticket_id", "ticket", "check", "check_number", "check #", "order_number", "pos_order"],
    "ticket",
  );
  const orderId = pickColumn(header, [
    "order_id",
    "platform_order_id",
    "online_order_id",
    "doordash_order",
    "uber_order",
    "external_id",
    "marketplace_id",
  ]);
  const ticketAt = pickColumn(header, ["ticket_at", "datetime", "date", "opened_at", "paid_at", "order_date"]);
  const gross = requireColumn(header, ["gross", "total", "amount", "subtotal", "check_total"], "amount");
  const status = pickColumn(header, ["status", "state", "ticket_status"]);

  return rows.map((row, index) => ({
    id: `pos_${index + 1}_${crypto.randomUUID().slice(0, 6)}`,
    locationId,
    ticketId: cell(row, ticketId),
    platformOrderId: cell(row, orderId) || cell(row, ticketId),
    ticketAt: cell(row, ticketAt),
    grossCents: parseCentsCell(cell(row, gross), "POS amount"),
    status: posStatus(cell(row, status)),
  }));
}

export function parseDeliveryCsv(
  csv: string,
  locationId: string,
  options: { defaultPlatform?: Platform } = {},
): DeliveryItem[] {
  const text = csv.trim();
  if (!text) {
    throw new Error("Paste or upload a DoorDash / Uber / Grubhub payout CSV.");
  }
  const [header, ...rows] = parseRows(text);
  if (!header) {
    throw new Error("Payout CSV is empty.");
  }

  const fallback = options.defaultPlatform ?? "doordash";
  const platform = pickColumn(header, ["platform", "channel", "source", "app"]);
  const orderId = requireColumn(
    header,
    ["order_id", "order id", "delivery_uuid", "marketplace_order", "order #", "order_number"],
    "order ID",
  );
  const payoutItemId = pickColumn(header, ["payout_item_id", "transaction_id", "transaction id", "payout_id"]);
  const payoutBatchId = pickColumn(header, [
    "payout_batch_id",
    "transfer_id",
    "deposit_id",
    "batch_id",
    "payout_id",
  ]);
  const soldAt = pickColumn(header, [
    "sold_at",
    "order_date",
    "order date",
    "timestamp",
    "transaction_date",
    "created_at",
    "date",
  ]);
  const reportedAt = pickColumn(header, [
    "refund_date",
    "adjustment_date",
    "reported_at",
    "error_date",
    "updated_at",
  ]);
  const gross = pickColumn(header, [
    "gross",
    "gross_sales",
    "subtotal",
    "store_sales",
    "sales",
    "merchandise",
    "item_subtotal",
  ]);
  const commission = pickColumn(header, [
    "commission",
    "marketplace_fee",
    "doordash_fee",
    "uber_fee",
    "commission_fee",
  ]);
  const adjustment = pickColumn(header, [
    "adjustment",
    "error_charge",
    "error charge",
    "refund_amount",
    "adjustments",
    "adjustments_deductions",
    "deductions",
  ]);
  const adjHeader = adjustment >= 0 ? normHeader(header[adjustment]) : "";
  const errorChargeIsTake = /error|refund|deduct/.test(adjHeader);
  const net = pickColumn(header, ["net_payout", "store_payment", "total_payout", "net_total", "net"]);
  const status = pickColumn(header, ["status", "transaction_type", "type", "order_status"]);
  const reason = pickColumn(header, [
    "adjustment_reason",
    "description",
    "reason",
    "error_reason",
    "notes",
    "details",
  ]);

  return rows.map((row, index) => {
    const type = cell(row, status);
    const rawReason = cell(row, reason);
    const grossCents = Math.abs(parseCentsCell(cell(row, gross), "payout subtotal"));
    const commissionCents = Math.abs(parseCentsCell(cell(row, commission), "commission"));
    let adjustmentCents = parseCentsCell(cell(row, adjustment), "adjustment");
    if (errorChargeIsTake && adjustmentCents > 0) {
      adjustmentCents = -adjustmentCents;
    }
    const netRaw = cell(row, net);
    const netCents = netRaw
      ? parseCentsCell(netRaw, "net payout")
      : grossCents - commissionCents + adjustmentCents;
    const itemStatus = deliveryStatus(type, rawReason);
    const adjustmentReason = maybeLateReport(cell(row, soldAt), cell(row, reportedAt), rawReason || type);

    return {
      id: `dlv_${index + 1}_${crypto.randomUUID().slice(0, 6)}`,
      locationId,
      platform: cell(row, platform)
        ? guessPlatform(cell(row, platform), fallback)
        : platformFromOrder(cell(row, orderId), fallback),
      orderId: cell(row, orderId),
      payoutItemId: cell(row, payoutItemId) || cell(row, orderId),
      payoutBatchId: cell(row, payoutBatchId) || "payout",
      soldAt: cell(row, soldAt),
      grossCents,
      commissionCents,
      adjustmentCents,
      netCents,
      status: itemStatus,
      adjustmentReason,
    };
  });
}

export function parseBankCsv(
  csv: string,
  locationId: string,
  options: { defaultPlatform?: Platform } = {},
): BankDeposit[] {
  const text = csv.trim();
  if (!text) {
    return [];
  }
  const [header, ...rows] = parseRows(text);
  if (!header) {
    return [];
  }

  const fallback = options.defaultPlatform ?? "doordash";
  const platform = pickColumn(header, ["platform", "channel", "source"]);
  const payoutBatchId = pickColumn(header, ["payout_batch_id", "payout", "transfer_id", "batch", "id"]);
  const postedOn = requireColumn(header, ["posted_on", "date", "posted", "transaction_date"], "date");
  const amount = requireColumn(header, ["amount", "deposit", "credit", "value"], "amount");
  const account = pickColumn(header, ["account", "account_number", "masked_account"]);
  const memo = pickColumn(header, ["memo", "description", "narrative", "details"]);

  return rows.map((row, index) => ({
    id: `dep_${index + 1}_${crypto.randomUUID().slice(0, 6)}`,
    locationId,
    platform: guessPlatform(cell(row, platform), fallback),
    payoutBatchId: cell(row, payoutBatchId) || "payout",
    postedOn: cell(row, postedOn),
    amountCents: parseCentsCell(cell(row, amount), "deposit amount"),
    maskedAccount: cell(row, account),
    memo: cell(row, memo),
  }));
}
