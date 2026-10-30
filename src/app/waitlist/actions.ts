"use server";

import { waitlistSchema } from "@/domain/schemas";
import { supabaseEnabled } from "@/lib/config";
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

  if (process.env.VERCEL && !supabaseEnabled) {
    return {
      error: "The waitlist is not wired to a database yet. Email support@dishpute.com and we’ll put you on the list.",
    };
  }

  await addWaitlistEntry(parsed.data);
  return { success: true };
}
