export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@yourdomain.com";

export const clerkPublishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

export const clerkEnabled = clerkPublishableKey.startsWith("pk_");
