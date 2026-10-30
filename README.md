# 4th Party

Delivery payout reconciliation for restaurants. Match POS tickets to DoorDash / Uber Eats payouts to bank deposits. Flag unpaid cancellations. Write the dispute letter.

This repo is usable locally without Clerk, Postgres, or hosting. Those plug in later without rewriting the matching engine.

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The landing waitlist and the Good Burger demo week live in `data/workspace-*.json` (created on first load, ignored by git).

## What is real today

- Three-way match on integer cents
- Contracted commission rates, not whatever the payout file claims
- CSV ingest for POS, delivery, and bank
- Dispute letters you can copy
- Masked source credentials
- Zod on every write

## What you add later

- **Auth:** Clerk around `/dashboard`
- **Database:** implement `src/lib/store.ts` with Prisma using `prisma/schema.prisma` (same fields)
- **Hosting:** Vercel or similar
- **Live APIs:** fill the same POS / delivery / bank records instead of CSV paste

## CSV columns

POS: `ticket_id,order_id,ticket_at,gross,status`

Delivery: `platform,order_id,payout_item_id,payout_batch_id,sold_at,gross,commission,adjustment,net,status,adjustment_reason`

Bank: `platform,payout_batch_id,posted_on,amount,account,memo`

Amounts are dollars (`54.00`), stored as cents.

## Name

4th Party is a working name. `fourthparty.app` is an unrelated mediation product.
