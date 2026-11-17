import assert from "node:assert/strict";
import test from "node:test";
import { parseDeliveryCsv, parsePlatform, parseRows } from "./csv";

test("parseRows keeps commas inside quoted cells", () => {
  const rows = parseRows(`a,b\n"one, two",three`);
  assert.deepEqual(rows[1], ["one, two", "three"]);
});

test("parsePlatform maps grubhub and uber aliases", () => {
  assert.equal(parsePlatform("Grubhub"), "grubhub");
  assert.equal(parsePlatform("Uber Eats"), "uber_eats");
  assert.equal(parsePlatform("DoorDash"), "doordash");
});

test("delivery CSV keeps grubhub and quoted reasons", () => {
  const csv = `platform,order_id,payout_item_id,payout_batch_id,sold_at,gross,commission,adjustment,net,status,adjustment_reason
grubhub,GH-1,GHI-1,GH-W1,2026-10-14T12:00:00.000Z,20.00,5.00,0.00,15.00,canceled,"Customer canceled, after pickup"`;
  const [row] = parseDeliveryCsv(csv, "loc_1");
  assert.equal(row.platform, "grubhub");
  assert.equal(row.adjustmentReason, "Customer canceled, after pickup");
});

test("maps a DoorDash-style payout export without our column names", () => {
  const csv = `Transaction ID,Order ID,Timestamp,Transaction Type,Subtotal,Commission,Error Charge,Net Payout,Description
DDT-1,DD-4418,2026-10-15,Error Charge,36.50,0.00,-36.50,-36.50,Order never arrived
DDT-2,UE-9188,2026-10-16,Delivery,22.00,6.60,0.00,15.40,`;
  const rows = parseDeliveryCsv(csv, "loc_1");
  assert.equal(rows[0]?.orderId, "DD-4418");
  assert.equal(rows[0]?.status, "canceled");
  assert.equal(rows[0]?.netCents, -3650);
  assert.equal(rows[1]?.platform, "uber_eats");
  assert.equal(rows[1]?.status, "paid");
});
