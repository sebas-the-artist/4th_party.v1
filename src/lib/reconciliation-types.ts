export type ReconciliationStatus =
  | "Matched"
  | "Short deposit"
  | "Error charge"
  | "Unmatched refund";

export type ReconciliationRow = {
  id: string;
  store: string;
  platform: string;
  expected: string;
  received: string;
  variance: string;
  status: ReconciliationStatus;
  date: string;
  time: string;
};

export type ReconciliationDetail = ReconciliationRow & {
  note: string;
  expectedCents: number;
  receivedCents: number;
  varianceCents: number;
};

/* export type ReconciliationStatus =
  | "Matched"
  | "Short deposit"
  | "Error charge"
  | "Unmatched refund";

export type ReconciliationRow = {
  id: string;
  store: string;
  platform: string;
  expected: string;
  received: string;
  variance: string;
  status: ReconciliationStatus;
  date: string;
  time: string;
};

export type ReconciliationDetail = ReconciliationRow & {
  note: string;
};
 */

/* export type ReconciliationStatus =
  | "Short deposit"
  | "Error charge"
  | "Unmatched refund"
  | "Matched";

export type ReconciliationRow = {
  id: string;
  store: string;
  platform: string;
  expected: string;
  received: string;
  variance: string;
  status: ReconciliationStatus;
};

export type ReconciliationDetail = ReconciliationRow & {
  date: string;
  time: string;
  note: string;
};

export type Exception = {
  id: string;
  store: string;
  platform: string;
  issue: ReconciliationStatus;
  amount: string;
  age: string;
};
 */