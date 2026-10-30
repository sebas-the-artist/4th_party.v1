"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { addLocationSchema, contactSchema } from "@/domain/schemas";
import type { DisputeStatus } from "@/domain/types";
import { DISPUTE_STATUSES } from "@/domain/types";
import { writeStoreCookie } from "@/lib/store-context";
import {
  addLocation,
  markDispute,
  resetDemoWorkspace,
  resolveMatch,
  runFromCsv,
  saveContact,
  saveDisputeDraft,
  toggleSource,
} from "@/lib/workspace";

function refresh() {
  revalidatePath("/", "layout");
  revalidatePath("/dashboard", "layout");
}

const MAX_CSV_BYTES = 1_500_000;

async function csvFromForm(formData: FormData, textName: string, fileName: string): Promise<string> {
  const file = formData.get(fileName);
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_CSV_BYTES) {
      throw new Error("A CSV is over 1.5 MB. Split the week or export a smaller file.");
    }
    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();
    const looksCsv =
      name.endsWith(".csv") ||
      name.endsWith(".txt") ||
      type.includes("csv") ||
      type.startsWith("text/") ||
      type === "application/vnd.ms-excel" ||
      type === "";
    if (!looksCsv) {
      throw new Error("Upload a .csv or .txt file.");
    }
    return (await file.text()).trim();
  }
  return String(formData.get(textName) ?? "").trim();
}

export async function loadDemoAction() {
  await resetDemoWorkspace();
  refresh();
  redirect("/dashboard");
}

export async function selectStoreAction(formData: FormData) {
  const locationId = String(formData.get("locationId") ?? "");
  if (!locationId) {
    return;
  }
  await writeStoreCookie(locationId);
  refresh();
}

export async function addLocationAction(
  _previous: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const parsed = addLocationSchema.safeParse({
    name: formData.get("name"),
    storeNumber: formData.get("storeNumber"),
    address: formData.get("address"),
    city: formData.get("city"),
    state: formData.get("state"),
    postalCode: formData.get("postalCode"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the location details." };
  }
  const location = await addLocation(parsed.data);
  await writeStoreCookie(location.id);
  refresh();
  redirect("/dashboard/locations");
}

export type IngestState = { error?: string };

const ingestSchema = z.object({
  locationId: z.string().min(1),
  periodStart: z.string().min(8),
  periodEnd: z.string().min(8),
  posCsv: z.string().trim().min(1, "Paste the POS CSV."),
  deliveryCsv: z.string().trim().min(1, "Paste the delivery CSV."),
  bankCsv: z.string().trim().min(1, "Paste the bank CSV."),
});

export async function ingestCsvAction(
  _previous: IngestState,
  formData: FormData,
): Promise<IngestState> {
  try {
    const parsed = ingestSchema.safeParse({
      locationId: formData.get("locationId"),
      periodStart: formData.get("periodStart"),
      periodEnd: formData.get("periodEnd"),
      posCsv: await csvFromForm(formData, "posCsv", "posFile"),
      deliveryCsv: await csvFromForm(formData, "deliveryCsv", "deliveryFile"),
      bankCsv: await csvFromForm(formData, "bankCsv", "bankFile"),
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Check the CSV and try again." };
    }

    await runFromCsv(parsed.data);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not run reconciliation.",
    };
  }

  refresh();
  redirect("/dashboard/reconciliations");
}

export async function copyDisputeAction(formData: FormData) {
  const matchId = String(formData.get("matchId") ?? "");
  if (!matchId) {
    return;
  }
  await markDispute(matchId, "ready");
  refresh();
}

export async function resolveMatchAction(formData: FormData) {
  const matchId = String(formData.get("matchId") ?? "");
  const outcome = String(formData.get("outcome") ?? "approved");
  if (!matchId) {
    return;
  }
  const workspace = await resolveMatch(matchId, outcome === "denied" ? "denied" : "approved");
  const match = workspace.matches.find((item) => item.id === matchId);
  refresh();
  if (match && outcome !== "denied" && match.recoveredCents > 0) {
    redirect(`/dashboard/reconciliations/${matchId}?recovered=${match.recoveredCents}`);
  }
}

export async function saveContactAction(
  _previous: { error?: string; saved?: boolean },
  formData: FormData,
): Promise<{ error?: string; saved?: boolean }> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    title: formData.get("title"),
    phone: formData.get("phone"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the contact details." };
  }
  await saveContact(parsed.data);
  refresh();
  return { saved: true };
}

export async function saveDisputeAction(formData: FormData) {
  const disputeId = String(formData.get("disputeId") ?? "");
  const body = String(formData.get("body") ?? "");
  const subject = String(formData.get("subject") ?? "");
  const toEmail = String(formData.get("toEmail") ?? "");
  const statusRaw = String(formData.get("status") ?? "draft");
  const status = (DISPUTE_STATUSES as readonly string[]).includes(statusRaw)
    ? (statusRaw as DisputeStatus)
    : "draft";
  if (!disputeId) {
    return;
  }
  await saveDisputeDraft({ disputeId, body, subject, toEmail, status });
  refresh();
}

export async function toggleSourceAction(formData: FormData) {
  const sourceId = String(formData.get("sourceId") ?? "");
  if (!sourceId) {
    return;
  }
  await toggleSource(sourceId);
  refresh();
}
