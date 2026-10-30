export const SAMPLE_POS_CSV = `ticket_id,order_id,ticket_at,gross,status
T-2101,DD-5102,2026-10-14T18:04:00.000Z,54.00,completed
T-2104,UE-3301,2026-10-14T19:22:00.000Z,33.50,completed`;

export const SAMPLE_DELIVERY_CSV = `platform,order_id,payout_item_id,payout_batch_id,sold_at,gross,commission,adjustment,net,status,adjustment_reason
doordash,DD-5102,DDI-1001,DD-W42,2026-10-14T18:04:00.000Z,54.00,13.50,0.00,40.50,paid,
uber_eats,UE-3301,UEI-1001,UE-W42,2026-10-14T19:22:00.000Z,33.50,10.05,-4.00,19.45,adjusted,Error charge`;

export const SAMPLE_BANK_CSV = `platform,payout_batch_id,posted_on,amount,account,memo
doordash,DD-W42,2026-10-16,40.50,••••4419,DOORDASH PAYOUT DD-W42
uber_eats,UE-W42,2026-10-16,19.45,••••4419,UBER EATS PAYOUT UE-W42`;
