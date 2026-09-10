"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export type CreateReconciliationState = {
  error?: string;
};

const createReconciliationSchema = z.object({
  store: z.string().trim().min(1, "Enter a store name."),
  platform: z.enum(["DoorDash", "Uber Eats"], {
    error: "Choose a valid platform.",
  }),
  expected: z.string().trim().min(1, "Enter the expected payout."),
  received: z.string().trim().min(1, "Enter the received payout."),
  note: z.string().trim().min(1, "Add a review note."),
});

function parseAmount(value: string) {
  const amount = Number(value.replace(/[$,\s]/g, ""));

  if (!Number.isFinite(amount) || amount < 0) {
    return null;
  }

  return amount;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export async function createReconciliation(
  _previousState: CreateReconciliationState,
  formData: FormData,
): Promise<CreateReconciliationState> {
  const parsed = createReconciliationSchema.safeParse({
    store: formData.get("store"),
    platform: formData.get("platform"),
    expected: formData.get("expected"),
    received: formData.get("received"),
    note: formData.get("note"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check the form and try again.",
    };
  }

  const expectedAmount = parseAmount(parsed.data.expected);
  const receivedAmount = parseAmount(parsed.data.received);

  if (expectedAmount === null || receivedAmount === null) {
    return {
      error: "Enter valid non-negative payout amounts, such as 2450.00.",
    };
  }

  const varianceAmount = receivedAmount - expectedAmount;
  const now = new Date();

  const reconciliation = await prisma.reconciliation.create({
    data: {
      id: crypto.randomUUID(),
      store: parsed.data.store,
      platform: parsed.data.platform,
      expected: formatCurrency(expectedAmount),
      received: formatCurrency(receivedAmount),
      variance: formatCurrency(varianceAmount),
      status: varianceAmount === 0 ? "Matched" : "Short deposit",
      date: now.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      time: now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
      note: parsed.data.note,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/reconciliations");
  revalidatePath("/dashboard/exceptions");
  revalidatePath("/api/reconciliations");
  revalidatePath("/api/exceptions");

  redirect(`/dashboard/reconciliations/${reconciliation.id}`);
}

/* "use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function getStringValue(formData: FormData, name: string) {
  const value = formData.get(name);

  if (typeof value !== "string") {
    throw new Error(`${name} is required.`);
  }

  return value.trim();
}

function formatCurrency(value: string) {
  const amount = Number(value.replace(/[$,]/g, ""));

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Enter a valid non-negative payout amount.");
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export async function createReconciliation(formData: FormData) {
  const store = getStringValue(formData, "store");
  const platform = getStringValue(formData, "platform");
  const expectedInput = getStringValue(formData, "expected");
  const receivedInput = getStringValue(formData, "received");
  const note = getStringValue(formData, "note");

  if (!store || !platform || !expectedInput || !receivedInput || !note) {
    throw new Error("Please complete every field.");
  }

  if (platform !== "DoorDash" && platform !== "Uber Eats") {
    throw new Error("Select a supported platform.");
  }

  const expectedAmount = Number(expectedInput.replace(/[$,]/g, ""));
  const receivedAmount = Number(receivedInput.replace(/[$,]/g, ""));

  const expected = formatCurrency(expectedInput);
  const received = formatCurrency(receivedInput);
  const varianceAmount = receivedAmount - expectedAmount;
  const variance = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(varianceAmount);

  const now = new Date();

  const reconciliation = await prisma.reconciliation.create({
     data: {    //i put the "data: " in front of the object to fix the error
      id: crypto.randomUUID(),
      store,
      platform,
      expected,
      received,
      variance,
      status: varianceAmount === 0 ? "Matched" : "Short deposit",
      date: now.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      time: now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
      note,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/reconciliations");
  revalidatePath("/dashboard/exceptions");
  revalidatePath("/api/reconciliations");
  revalidatePath("/api/exceptions");

  redirect(`/dashboard/reconciliations/${reconciliation.id}`);
} */