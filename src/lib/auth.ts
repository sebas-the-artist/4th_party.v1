import { clerkEnabled } from "@/lib/config";

export async function currentOwnerId(): Promise<string> {
  if (!clerkEnabled) {
    return "demo";
  }

  const { auth } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  return userId ?? "demo";
}

export async function currentUserEmail(): Promise<string | null> {
  const profile = await currentUserProfile();
  return profile.email || null;
}

export async function currentUserProfile(): Promise<{ name: string; email: string }> {
  if (!clerkEnabled) {
    return { name: "", email: "" };
  }

  const { currentUser } = await import("@clerk/nextjs/server");
  const user = await currentUser();
  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    user?.fullName?.trim() ||
    "";
  const email =
    user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress ?? "";
  return { name, email };
}

export async function isSignedIn(): Promise<boolean> {
  if (!clerkEnabled) {
    return false;
  }
  const { auth } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  return Boolean(userId);
}
