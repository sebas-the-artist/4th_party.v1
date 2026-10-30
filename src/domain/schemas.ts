import { z } from "zod";
import {
  DISPUTE_STATUSES,
  MATCH_STATUSES,
  PLATFORMS,
  RUN_STATUSES,
  SOURCE_KINDS,
} from "@/domain/types";

const cents = z.number().int();
const isoDate = z.string().min(8);

export const waitlistSchema = z.object({
  email: z.string().trim().email("Use a real email."),
  restaurant: z.string().trim().min(2, "Add the restaurant or group name.").max(120),
});

export const csvTextSchema = z.object({
  locationId: z.string().min(1),
  periodStart: z.string().min(8),
  periodEnd: z.string().min(8),
  posCsv: z.string().trim().min(1, "Paste a POS CSV."),
  deliveryCsv: z.string().trim().min(1, "Paste a DoorDash / Uber CSV."),
  bankCsv: z.string().trim().min(1, "Paste a bank CSV."),
});

export const addLocationSchema = z.object({
  name: z.string().trim().min(2).max(80),
  storeNumber: z.string().trim().min(1).max(12),
  address: z.string().trim().min(4).max(120),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(2),
  postalCode: z.string().trim().min(5).max(10),
});

export const contactSchema = z.object({
  name: z.string().trim().max(80),
  title: z.string().trim().max(80),
  phone: z.string().trim().max(40),
  email: z
    .string()
    .trim()
    .transform((value) => value.toLowerCase())
    .refine(
      (value) => value === "" || z.string().email().safeParse(value).success,
      "Use a real email.",
    ),
});

export const posOrderSchema = z.object({
  id: z.string(),
  locationId: z.string(),
  ticketId: z.string(),
  platformOrderId: z.string(),
  ticketAt: isoDate,
  grossCents: cents.nonnegative(),
  status: z.enum(["completed", "voided", "refunded"]),
});

export const deliveryItemSchema = z.object({
  id: z.string(),
  locationId: z.string(),
  platform: z.enum(PLATFORMS),
  orderId: z.string(),
  payoutItemId: z.string(),
  payoutBatchId: z.string(),
  soldAt: isoDate,
  grossCents: cents.nonnegative(),
  commissionCents: cents,
  adjustmentCents: cents,
  netCents: cents,
  status: z.enum(["paid", "canceled", "refunded", "adjusted"]),
  adjustmentReason: z.string(),
});

export const bankDepositSchema = z.object({
  id: z.string(),
  locationId: z.string(),
  platform: z.enum(PLATFORMS),
  payoutBatchId: z.string(),
  postedOn: isoDate,
  amountCents: cents,
  maskedAccount: z.string(),
  memo: z.string(),
});

const disputeStatusSchema = z
  .enum([...DISPUTE_STATUSES, "copied", "submitted"] as const)
  .transform((status) => {
    if (status === "copied") return "ready" as const;
    if (status === "submitted") return "sent" as const;
    return status;
  });

export const workspaceSchema = z.object({
  version: z.union([z.literal(1), z.literal(2)]).transform(() => 2 as const),
  ownerId: z.string().default("demo"),
  contact: z
    .object({
      name: z.string().default(""),
      title: z.string().default(""),
      phone: z.string().default(""),
      email: z.string().default(""),
    })
    .default({ name: "", title: "", phone: "", email: "" }),
  locations: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      storeNumber: z.string().default("000"),
      address: z.string().default(""),
      city: z.string(),
      state: z.string().default(""),
      postalCode: z.string().default(""),
      billingActive: z.boolean().default(true),
    }),
  ),
  sources: z.array(
    z.object({
      id: z.string(),
      locationId: z.string(),
      kind: z.enum(SOURCE_KINDS),
      label: z.string(),
      platform: z.enum(PLATFORMS).optional(),
      commissionBps: z.number().int().nonnegative().optional(),
      maskedCredential: z.string(),
      connected: z.boolean(),
      supportEmail: z.string().optional(),
    }),
  ),
  posOrders: z.array(posOrderSchema),
  deliveryItems: z.array(deliveryItemSchema),
  bankDeposits: z.array(bankDepositSchema),
  runs: z.array(
    z.object({
      id: z.string(),
      locationId: z.string(),
      periodStart: isoDate,
      periodEnd: isoDate,
      status: z.enum(RUN_STATUSES),
      netVarianceCents: cents,
      createdAt: isoDate,
    }),
  ),
  matches: z.array(
    z.object({
      id: z.string(),
      runId: z.string(),
      locationId: z.string(),
      platform: z.union([z.enum(PLATFORMS), z.literal("bank")]),
      posOrderId: z.string().optional(),
      deliveryItemId: z.string().optional(),
      bankDepositId: z.string().optional(),
      status: z.enum(MATCH_STATUSES),
      expectedCents: cents,
      receivedCents: cents,
      varianceCents: cents,
      recoveredCents: cents.nonnegative().default(0),
      summary: z.string(),
      disputeText: z.string(),
    }),
  ),
  disputes: z.array(
    z.object({
      id: z.string(),
      matchId: z.string(),
      runId: z.string(),
      locationId: z.string().default(""),
      status: disputeStatusSchema,
      subject: z.string().default(""),
      body: z.string(),
      toEmail: z.string().default(""),
      updatedAt: isoDate,
    }),
  ),
  waitlist: z.array(
    z.object({
      id: z.string(),
      email: z.string().email(),
      restaurant: z.string(),
      createdAt: isoDate,
    }),
  ),
});
