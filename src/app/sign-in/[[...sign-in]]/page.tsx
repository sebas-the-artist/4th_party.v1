import Link from "next/link";
import { clerkKeysReady } from "@/lib/clerk-env";
import { showPublicDemo } from "@/lib/config";
import { SignInPanel } from "@/components/sign-in-panel";

export default function SignInPage() {
  const ready = clerkKeysReady();

  return (
    <main className="auth-page">
      <p className="page-header__kicker">Dishpute</p>
      <h1 className="page-header__title">Sign in</h1>
      {ready ? (
        <SignInPanel />
      ) : (
        <article className="note-card">
          <p>
            Sign in is not connected in this environment yet. If you just added
            Clerk keys on Vercel, redeploy once so this page can see them.
          </p>
          {showPublicDemo ? (
            <p>
              Locally, add <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> and{" "}
              <code>CLERK_SECRET_KEY</code> to <code>.env.local</code>, or{" "}
              <Link href="/dashboard">open the sample week</Link>.
            </p>
          ) : null}
        </article>
      )}
    </main>
  );
}
