import type {
  ReconciliationDetail,
  ReconciliationRow,
} from "@/lib/reconciliation-types";


/* export type ReconciliationRow = {
  id: string;
  store: string;
  platform: string;
  expected: string;
  received: string;
  variance: string;
  status: string;
};

export type ReconciliationDetail = {
  id: string;
  store: string;
  platform: string;
  expected: string;
  received: string;
  variance: string;
  date: string;
  time: string;
  status: string;
  note: string;
};
 */

export const reconciliationRows: ReconciliationRow[] = [
  {
    id: "014",
    store: "Store 014",
    platform: "DoorDash",
    expected: "$8,420.00",
    received: "$8,335.80",
    variance: "-$84.20",
    status: "Short deposit",
  },
  {
    id: "009",
    store: "Store 009",
    platform: "Uber Eats",
    expected: "$5,210.00",
    received: "$5,178.60",
    variance: "-$31.40",
    status: "Error charge",
  },
  {
    id: "022",
    store: "Store 022",
    platform: "DoorDash",
    expected: "$3,880.00",
    received: "$3,862.00",
    variance: "-$18.00",
    status: "Unmatched refund",
  },
  {
    id: "031",
    store: "Store 031",
    platform: "Uber Eats",
    expected: "$6,144.00",
    received: "$6,144.00",
    variance: "$0.00",
    status: "Matched",
  },
];

export const reconciliationDetails: Record<string, ReconciliationDetail> = {
  "014": {
    id: "014",
    store: "Store 014",
    platform: "DoorDash",
    expected: "$8,420.00",
    received: "$8,335.80",
    variance: "-$84.20",
    date: "Jul 29, 2026",
    time: "2:14 PM",
    status: "Short deposit",
    note: "Deposit came in below the expected payout after a completed order batch.",
  },
  "009": {
    id: "009",
    store: "Store 009",
    platform: "Uber Eats",
    expected: "$5,210.00",
    received: "$5,178.60",
    variance: "-$31.40",
    date: "Jul 29, 2026",
    time: "4:08 PM",
    status: "Error charge",
    note: "Platform deduction appears tied to an order-level error charge.",
  },
  "022": {
    id: "022",
    store: "Store 022",
    platform: "DoorDash",
    expected: "$3,880.00",
    received: "$3,862.00",
    variance: "-$18.00",
    date: "Jul 28, 2026",
    time: "11:32 AM",
    status: "Unmatched refund",
    note: "Refund was logged, but the matching payout adjustment did not line up cleanly.",
  },
  "031": {
    id: "031",
    store: "Store 031",
    platform: "Uber Eats",
    expected: "$6,144.00",
    received: "$6,144.00",
    variance: "$0.00",
    date: "Jul 30, 2026",
    time: "9:20 AM",
    status: "Matched",
    note: "This payout matched the platform and bank totals with no variance.",
  },
};
