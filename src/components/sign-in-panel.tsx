"use client";

import { SignIn } from "@clerk/nextjs";

export function SignInPanel() {
  return (
    <SignIn
      routing="path"
      path="/sign-in"
      signUpUrl="/sign-up"
      fallbackRedirectUrl="/dashboard"
    />
  );
}
