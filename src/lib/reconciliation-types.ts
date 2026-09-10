export type ReconciliationStatus =
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
