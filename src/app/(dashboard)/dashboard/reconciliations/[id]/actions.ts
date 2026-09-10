"use server";

import { revalidatePath } from "next/cache";
import { updateReconciliationStatus } from "@/lib/reconciliations";
import type { ReconciliationStatus } from "@/lib/reconciliation-types";

export type ReopenReconciliationState = {
  error?: string;
};

const reopenStatuses = [
  "Short deposit",
  "Error charge",
  "Unmatched refund",
] as const satisfies readonly ReconciliationStatus[];

function revalidateReconciliationPaths(id: string) {
  revalidatePath(`/dashboard/reconciliations/${id}`);
  revalidatePath("/dashboard/reconciliations");
  revalidatePath("/dashboard/exceptions");
  revalidatePath("/dashboard");
  revalidatePath("/api/reconciliations");
  revalidatePath(`/api/reconciliations/${id}`);
  revalidatePath("/api/exceptions");
}

export async function resolveReconciliation(formData: FormData) {
  const id = formData.get("id");

  if (typeof id !== "string" || id.length === 0) {
    throw new Error("A reconciliation ID is required.");
  }

  await updateReconciliationStatus(id, "Matched");
  revalidateReconciliationPaths(id);
}

export async function reopenReconciliation(
  _previousState: ReopenReconciliationState,
  formData: FormData,
): Promise<ReopenReconciliationState> {
  const id = formData.get("id");
  const status = formData.get("status");

  if (typeof id !== "string" || id.length === 0) {
    return {
      error: "This reconciliation is missing an ID. Refresh and try again.",
    };
  }

  if (
    typeof status !== "string" ||
    !reopenStatuses.includes(status as (typeof reopenStatuses)[number])
  ) {
    return {
      error: "Choose a valid exception reason.",
    };
  }

  await updateReconciliationStatus(
    id,
    status as (typeof reopenStatuses)[number],
  );

  revalidateReconciliationPaths(id);

  return {};
}


/* "use server";

import { revalidatePath } from "next/cache";
import { updateReconciliationStatus } from "@/lib/reconciliations";

function revalidateReconciliationPaths(id: string) {
  revalidatePath(`/dashboard/reconciliations/${id}`);
  revalidatePath("/dashboard/reconciliations");
  revalidatePath("/dashboard/exceptions");
  revalidatePath("/dashboard");
  revalidatePath("/api/reconciliations");
  revalidatePath(`/api/reconciliations/${id}`);
  revalidatePath("/api/exceptions");
}

export async function resolveReconciliation(formData: FormData) {
  const id = formData.get("id");

  if (typeof id !== "string" || id.length === 0) {
    throw new Error("A reconciliation ID is required.");
  }

  await updateReconciliationStatus(id, "Matched");
  revalidateReconciliationPaths(id);
}

export async function reopenReconciliation(formData: FormData) {
  const id = formData.get("id");
  const status = formData.get("status");

  if (typeof id !== "string" || id.length === 0) {
    throw new Error("A reconciliation ID is required.");
  }

  if (
    status !== "Short deposit" &&
    status !== "Error charge" &&
    status !== "Unmatched refund"
  ) {
    throw new Error("A valid exception status is required.");
  }

  await updateReconciliationStatus(id, status);
  revalidateReconciliationPaths(id);
}
 */

/* "use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function resolveReconciliation(formData: FormData) {
  const id = formData.get("id");

  if (typeof id !== "string" || id.length === 0) {
    throw new Error("A reconciliation ID is required.");
  }

  await prisma.reconciliation.update({
    where: {
      id,
    },
    data: {
      status: "Matched",
    },
  });

  revalidatePath(`/dashboard/reconciliations/${id}`);
  revalidatePath("/dashboard/reconciliations");
  revalidatePath("/dashboard/exceptions");
  revalidatePath("/dashboard");
  revalidatePath("/api/reconciliations");
  revalidatePath(`/api/reconciliations/${id}`);
  revalidatePath("/api/exceptions");
}
 */