export const PRODUCT_NAME = "Dishpute";

export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@dishpute.com";

export const clerkPublishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

export const clerkEnabled = clerkPublishableKey.startsWith("pk_");

/** Local `next dev` can open the dashboard without Clerk. Vercel production cannot. */
export const showPublicDemo = process.env.NODE_ENV !== "production";

export const supabaseUrl =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const supabaseEnabled = Boolean(supabaseUrl && supabaseServiceKey);
