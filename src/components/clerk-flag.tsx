"use client";

import { createContext, useContext, type ReactNode } from "react";

const ClerkFlag = createContext(false);

export function ClerkFlagProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: ReactNode;
}) {
  return <ClerkFlag.Provider value={enabled}>{children}</ClerkFlag.Provider>;
}

export function useClerkEnabled() {
  return useContext(ClerkFlag);
}
