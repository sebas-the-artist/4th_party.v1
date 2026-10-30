"use client";

import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkEnabled, clerkPublishableKey } from "@/lib/config";

export function AppProviders({ children }: { children: ReactNode }) {
  if (!clerkEnabled) {
    return children;
  }

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      afterSignOutUrl="/"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      {children}
    </ClerkProvider>
  );
}
