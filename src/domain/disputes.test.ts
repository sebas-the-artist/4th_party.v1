import assert from "node:assert/strict";
import test from "node:test";
import { hasLetterBlanks, stampSignature, stripSignature } from "./disputes";

const first = `Hello DoorDash Merchant Support,

The POS ticket T-1887 was completed.

Thank you,
Alex
GM
Good Burger
239-555-0000
alex@old.example`;

test("stampSignature replaces an already filled sign-off", () => {
  const next = stampSignature(first, {
    name: "Jordan Blake",
    title: "Owner",
    phone: "239-555-0140",
    email: "jordan@goodburger.example",
  }, "Good Burger");

  assert.equal(stripSignature(next).includes("T-1887"), true);
  assert.equal(next.includes("Alex"), false);
  assert.equal(next.includes("Jordan Blake"), true);
  assert.equal(next.includes("jordan@goodburger.example"), true);
  assert.equal(hasLetterBlanks(next), false);
});

test("stampSignature keeps [brackets] when a field is empty", () => {
  const next = stampSignature(first, {
    name: "Jordan Blake",
    title: "",
    phone: "",
    email: "jordan@goodburger.example",
  }, "Good Burger");
  assert.equal(next.includes("[Your title]"), true);
  assert.equal(next.includes("[Phone]"), true);
  assert.equal(hasLetterBlanks(next), true);
});
