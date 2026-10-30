"use client";

import Link from "next/link";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { clerkEnabled } from "@/lib/config";

export function LandingAuth() {
  if (!clerkEnabled) {
    return (
      <>
        <Link href="/sign-in">Sign in</Link>
        <Link href="/dashboard">Open the sample week</Link>
      </>
    );
  }

  return <LandingAuthLoaded />;
}

function LandingAuthLoaded() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Link href="/dashboard">Open dashboard</Link>;
  }

  return (
    <>
      <SignInButton mode="redirect">
        <button className="landing-main__sign-in" type="button">
          Sign in
        </button>
      </SignInButton>
      <Link href="/dashboard">Open the sample week</Link>
    </>
  );
}
