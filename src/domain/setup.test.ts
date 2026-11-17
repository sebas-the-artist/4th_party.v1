import assert from "node:assert/strict";
import test from "node:test";
import { disputeDaysLeft, membershipCents } from "./setup";

test("first store is $39, each extra is $29", () => {
  assert.equal(membershipCents(0), 0);
  assert.equal(membershipCents(1), 3900);
  assert.equal(membershipCents(2), 6800);
  assert.equal(membershipCents(5), 15500);
});

test("dispute window counts down from 30 days", () => {
  const sold = Date.parse("2026-10-01T00:00:00.000Z");
  const now = Date.parse("2026-10-11T00:00:00.000Z");
  assert.equal(disputeDaysLeft("2026-10-01T00:00:00.000Z", now), 20);
  assert.ok(sold < now);
});
