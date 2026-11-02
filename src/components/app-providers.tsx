"use client";

import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";

export function AppProviders({
  children,
  publishableKey,
}: {
  children: ReactNode;
  publishableKey?: string;
}) {
  if (!publishableKey?.startsWith("pk_")) {
    return children;
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      afterSignOutUrl="/"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      {children}
    </ClerkProvider>
  );
}
