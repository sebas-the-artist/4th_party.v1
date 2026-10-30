"use client";

import { SignUp } from "@clerk/nextjs";

export function SignUpPanel() {
  return (
    <SignUp
      routing="path"
      path="/sign-up"
      signInUrl="/sign-in"
      fallbackRedirectUrl="/dashboard"
    />
  );
}
