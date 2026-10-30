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

function headerIndex(header: string[], name: string) {
  const index = header.findIndex((cell) => cell.toLowerCase() === name.toLowerCase());
  if (index === -1) {
    throw new Error(`CSV is missing column "${name}".`);
  }
  return index;
}

function cell(row: string[], index: number) {
  return row[index] ?? "";
}

function parseCentsCell(value: string, field: string) {
  try {
    return dollarsToCents(value);
  } catch {
    throw new Error(`${field} is not a valid amount.`);
  }
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
  const [header, ...rows] = parseRows(csv);
  if (!header) {
    throw new Error("POS CSV is empty.");
  }

  const ticketId = headerIndex(header, "ticket_id");
  const orderId = headerIndex(header, "order_id");
  const ticketAt = headerIndex(header, "ticket_at");
  const gross = headerIndex(header, "gross");
  const status = headerIndex(header, "status");

  return rows.map((row, index) => ({
    id: `pos_${index + 1}_${crypto.randomUUID().slice(0, 6)}`,
    locationId,
    ticketId: cell(row, ticketId),
    platformOrderId: cell(row, orderId),
    ticketAt: cell(row, ticketAt),
    grossCents: parseCentsCell(cell(row, gross), "POS gross"),
    status: cell(row, status) as PosOrder["status"],
  }));
}

export function parseDeliveryCsv(csv: string, locationId: string): DeliveryItem[] {
  const [header, ...rows] = parseRows(csv);
  if (!header) {
    throw new Error("Delivery CSV is empty.");
  }

  const platform = headerIndex(header, "platform");
  const orderId = headerIndex(header, "order_id");
  const payoutItemId = headerIndex(header, "payout_item_id");
  const payoutBatchId = headerIndex(header, "payout_batch_id");
  const soldAt = headerIndex(header, "sold_at");
  const gross = headerIndex(header, "gross");
  const commission = headerIndex(header, "commission");
  const adjustment = headerIndex(header, "adjustment");
  const net = headerIndex(header, "net");
  const status = headerIndex(header, "status");
  const reason = headerIndex(header, "adjustment_reason");

  return rows.map((row, index) => ({
    id: `dlv_${index + 1}_${crypto.randomUUID().slice(0, 6)}`,
    locationId,
    platform: parsePlatform(cell(row, platform)),
    orderId: cell(row, orderId),
    payoutItemId: cell(row, payoutItemId),
    payoutBatchId: cell(row, payoutBatchId),
    soldAt: cell(row, soldAt),
    grossCents: parseCentsCell(cell(row, gross), "delivery gross"),
    commissionCents: parseCentsCell(cell(row, commission), "commission"),
    adjustmentCents: parseCentsCell(cell(row, adjustment), "adjustment"),
    netCents: parseCentsCell(cell(row, net), "net"),
    status: cell(row, status) as DeliveryItem["status"],
    adjustmentReason: cell(row, reason),
  }));
}

export function parseBankCsv(csv: string, locationId: string): BankDeposit[] {
  const [header, ...rows] = parseRows(csv);
  if (!header) {
    throw new Error("Bank CSV is empty.");
  }

  const platform = headerIndex(header, "platform");
  const payoutBatchId = headerIndex(header, "payout_batch_id");
  const postedOn = headerIndex(header, "posted_on");
  const amount = headerIndex(header, "amount");
  const account = headerIndex(header, "account");
  const memo = headerIndex(header, "memo");

  return rows.map((row, index) => ({
    id: `dep_${index + 1}_${crypto.randomUUID().slice(0, 6)}`,
    locationId,
    platform: parsePlatform(cell(row, platform)),
    payoutBatchId: cell(row, payoutBatchId),
    postedOn: cell(row, postedOn),
    amountCents: parseCentsCell(cell(row, amount), "deposit amount"),
    maskedAccount: cell(row, account),
    memo: cell(row, memo),
  }));
}
