import assert from "node:assert/strict";
import test from "node:test";
import { confirmRecoveriesFromPayout, looksLikeReversal, recoveryTotals } from "./recovery";
import { EMPTY_WORKSPACE, type DeliveryItem, type MatchRecord } from "./types";

function item(partial: Partial<DeliveryItem> & Pick<DeliveryItem, "id" | "orderId">): DeliveryItem {
  return {
    locationId: "loc_1",
    platform: "doordash",
    payoutItemId: partial.id,
    payoutBatchId: "DD-W2",
    soldAt: "2026-10-22",
    grossCents: 3650,
    commissionCents: 0,
    adjustmentCents: 3650,
    netCents: 3650,
    status: "adjusted",
    adjustmentReason: "Error charge reversed",
    ...partial,
  };
}

function match(partial: Partial<MatchRecord> = {}): MatchRecord {
  return {
    id: "mch_1",
    runId: "run_1",
    locationId: "loc_1",
    platform: "doordash",
    deliveryItemId: "dlv_old",
    status: "unpaid_cancellation",
    expectedCents: 3650,
    receivedCents: 0,
    varianceCents: -3650,
    recoveredCents: 0,
    recoveryEvidence: "none",
    summary: "clawback",
    disputeText: "",
    ...partial,
  };
}

test("reversal language is not a normal paid line", () => {
  assert.equal(
    looksLikeReversal(item({ id: "a", orderId: "DD-1", adjustmentCents: 0, netCents: 4000, status: "paid", adjustmentReason: "" })),
    false,
  );
  assert.equal(looksLikeReversal(item({ id: "b", orderId: "DD-1" })), true);
});

test("later payout reversal confirms an open clawback and makes it billable", () => {
  const workspace = {
    ...EMPTY_WORKSPACE,
    deliveryItems: [item({ id: "dlv_old", orderId: "DD-4418", adjustmentCents: -3650, netCents: -3650, adjustmentReason: "Order never arrived" })],
    matches: [match({ deliveryItemId: "dlv_old" })],
    disputes: [
      {
        id: "dsp_1",
        matchId: "mch_1",
        runId: "run_1",
        locationId: "loc_1",
        status: "sent" as const,
        subject: "x",
        body: "x",
        toEmail: "",
        updatedAt: "2026-10-15T00:00:00.000Z",
      },
    ],
  };
  const next = confirmRecoveriesFromPayout(workspace, [item({ id: "dlv_new", orderId: "DD-4418" })]);
  assert.equal(next.matches[0]?.recoveryEvidence, "payout");
  assert.equal(next.matches[0]?.recoveredCents, 3650);
  assert.equal(recoveryTotals(next.matches).billable, 3650);
  assert.equal(recoveryTotals(next.matches).claimed, 0);
});

test("merchant-claimed recoveries are not billable", () => {
  const totals = recoveryTotals([
    match({ recoveredCents: 3650, recoveryEvidence: "merchant", status: "matched", varianceCents: 0 }),
  ]);
  assert.equal(totals.claimed, 3650);
  assert.equal(totals.billable, 0);
});
