export const SAMPLE_POS_CSV = `Check #,Date,Total,Status,Online Order ID
T-2101,2026-10-14,54.00,Paid,DD-5102
T-4418,2026-10-15,36.50,Paid,DD-4418`;

export const SAMPLE_DELIVERY_CSV = `Transaction ID,Order ID,Timestamp,Transaction Type,Subtotal,Commission,Error Charge,Net Payout,Description
DDT-1001,DD-5102,2026-10-14,Delivery,54.00,13.50,0.00,40.50,
DDT-1002,DD-4418,2026-10-15,Error Charge,36.50,0.00,-36.50,-36.50,Order never arrived
DDT-1003,DD-4420,2026-10-16,Error Charge,8.00,0.00,-8.00,-8.00,Missing item
DDT-1004,UE-9188,2026-10-16,Delivery,22.00,6.60,0.00,15.40,`;

export const SAMPLE_BANK_CSV = `Date,Amount,Description
2026-10-16,40.50,DOORDASH PAYOUT
2026-10-16,15.40,UBER EATS PAYOUT`;
