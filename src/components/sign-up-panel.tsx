"use client";

import { SignUp } from "@clerk/nextjs";

export function SignUpPanel() {
  return (
    <div className="auth-panel">
      <p className="page-header__text">
        Email is the working door. Google on production Clerk needs your own
        Google Cloud OAuth client ID — without it, Google shows “missing
        client_id.”
      </p>
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/dashboard"
      />
    </div>
  );
}
