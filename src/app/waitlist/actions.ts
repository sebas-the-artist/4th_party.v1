"use server";

import { waitlistSchema } from "@/domain/schemas";
import { sanitizeEmail } from "@/lib/security";
import { addWaitlistEntry } from "@/lib/workspace";

export type WaitlistState = {
  error?: string;
  success?: boolean;
};

export async function joinWaitlist(
  _previous: WaitlistState,
  formData: FormData,
): Promise<WaitlistState> {
  const parsed = waitlistSchema.safeParse({
    email: sanitizeEmail(String(formData.get("email") ?? "")),
    restaurant: String(formData.get("restaurant") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  await addWaitlistEntry(parsed.data);
  return { success: true };
}
