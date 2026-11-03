"use client";

import { SignIn } from "@clerk/nextjs";

export function SignInPanel() {
  return (
    <div className="auth-panel">
      <p className="page-header__text">
        Use email. Google on this production app needs a Google Cloud client ID
        in Clerk — until that is set, Google will show “missing client_id.”
        Email sign-in is the working door.
      </p>
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/dashboard"
      />
    </div>
  );
}
