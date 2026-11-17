import assert from "node:assert/strict";
import test from "node:test";
import { parseDeliveryCsv } from "./csv";
import { runMatchingEngine } from "./engine";
import { SAMPLE_DELIVERY_CSV } from "./samples";

test("payout-only run flags clawbacks and still keeps paid lines", () => {
  const deliveryItems = parseDeliveryCsv(SAMPLE_DELIVERY_CSV, "loc_1");
  const matches = runMatchingEngine({
    runId: "run_1",
    locationId: "loc_1",
    sources: [],
    posOrders: [],
    deliveryItems,
    bankDeposits: [],
  });
  const flags = matches.filter((match) => match.status !== "matched").map((match) => match.status).sort();
  assert.deepEqual(flags, ["unmatched_refund", "unpaid_cancellation"]);
  assert.equal(matches.filter((match) => match.status === "matched").length, 2);
  assert.equal(
    matches.find((match) => match.status === "unpaid_cancellation")?.summary.includes("DD-4418"),
    true,
  );
  const refund = matches.find((match) => match.status === "unmatched_refund");
  assert.ok(refund);
  assert.equal(refund.expectedCents > refund.receivedCents, true);
});

test("payout-only never flags a line that paid more than expected", () => {
  const csv = `Transaction ID,Order ID,Timestamp,Transaction Type,Subtotal,Commission,Error Charge,Net Payout,Description
DDT-1003,ORD-1003,2026-10-16,Adjustment,15.00,0.00,0.00,51.00,Error charge / refund`;
  const matches = runMatchingEngine({
    runId: "run_2",
    locationId: "loc_1",
    sources: [],
    posOrders: [],
    deliveryItems: parseDeliveryCsv(csv, "loc_1"),
    bankDeposits: [],
  });
  assert.equal(matches.length, 1);
  assert.equal(matches[0]?.status, "matched");
});

test("positive Error Charge is treated as a take, not extra money", () => {
  const csv = `Transaction ID,Order ID,Timestamp,Transaction Type,Subtotal,Commission,Error Charge,Net Payout,Description
DDT-9,ORD-9,2026-10-16,Error Charge,36.50,0.00,36.50,-36.50,Order never arrived`;
  const items = parseDeliveryCsv(csv, "loc_1");
  assert.equal(items[0]?.adjustmentCents, -3650);
  const matches = runMatchingEngine({
    runId: "run_3",
    locationId: "loc_1",
    sources: [],
    posOrders: [],
    deliveryItems: items,
    bankDeposits: [],
  });
  assert.equal(matches.length, 1);
  assert.equal(matches[0]?.status, "unpaid_cancellation");
  assert.equal(matches[0]?.expectedCents, 3650);
  assert.equal(matches[0]?.receivedCents, 0);
  assert.equal(matches[0]?.expectedCents > matches[0]?.receivedCents, true);
});

test("signed commission and deduction columns from a mixed payout report", () => {
  const csv = `Transaction_Date,Order_ID,Platform,Gross_Sales,Commission_Fee,Adjustments_Deductions,Net_Payout_Amount
2026-11-03,DD-2001,DoorDash,40.0,-8.0,0.0,32.0
2026-11-03,UE-5002,UberEats,65.0,-19.5,0.0,45.5
2026-11-04,DD-2003,DoorDash,110.0,-22.0,-25.0,63.0
2026-11-04,UE-5004,UberEats,35.5,-10.65,0.0,24.85
2026-11-05,DD-2005,DoorDash,85.0,-17.0,0.0,68.0
2026-11-05,UE-5006,UberEats,120.0,-36.0,0.0,84.0
2026-11-06,DD-2007,DoorDash,55.0,-11.0,0.0,44.0`;
  const items = parseDeliveryCsv(csv, "loc_1");
  assert.equal(items.length, 7);
  assert.equal(items[0]?.commissionCents, 800);
  assert.equal(items[2]?.adjustmentCents, -2500);
  assert.equal(items[1]?.platform, "uber_eats");
  const matches = runMatchingEngine({
    runId: "run_v2",
    locationId: "loc_1",
    sources: [],
    posOrders: [],
    deliveryItems: items,
    bankDeposits: [],
  });
  assert.equal(matches.length, 7);
  const short = matches.find((match) => match.summary.includes("DD-2003"));
  assert.ok(short);
  assert.equal(short.status, "unmatched_refund");
  assert.equal(short.expectedCents, 8800);
  assert.equal(short.receivedCents, 6300);
  assert.equal(matches.filter((match) => match.status === "matched").length, 6);
});
