export function dollarsToCents(value: string | number): number {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error("Amount is not a number.");
    }
    return Math.round(value * 100);
  }

  const cleaned = value.replace(/[$,\s]/g, "").trim();
  if (!cleaned) {
    throw new Error("Amount is required.");
  }

  const negative = cleaned.startsWith("-");
  const unsigned = negative ? cleaned.slice(1) : cleaned;
  const match = unsigned.match(/^(\d+)(?:\.(\d{1,2}))?$/);

  if (!match) {
    throw new Error("Enter an amount like 2450.00");
  }

  const dollars = Number(match[1]);
  const fraction = (match[2] ?? "00").padEnd(2, "0");
  const cents = dollars * 100 + Number(fraction);
  return negative ? -cents : cents;
}

export function formatCents(cents: number, options?: { sign?: "auto" | "always" }): string {
  const signMode = options?.sign ?? "auto";
  const absolute = Math.abs(cents);
  const dollars = Math.floor(absolute / 100);
  const remainder = String(absolute % 100).padStart(2, "0");
  const formatted = `$${dollars.toLocaleString("en-US")}.${remainder}`;

  if (cents < 0) {
    return `-${formatted}`;
  }
  if (signMode === "always" && cents > 0) {
    return `+${formatted}`;
  }
  return formatted;
}

export function centsVariance(receivedCents: number, expectedCents: number): number {
  return receivedCents - expectedCents;
}
