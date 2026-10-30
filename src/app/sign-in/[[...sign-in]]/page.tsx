import Link from "next/link";
import { clerkEnabled } from "@/lib/config";
import { SignInPanel } from "@/components/sign-in-panel";

export default function SignInPage() {
  return (
    <main className="auth-page">
      <p className="page-header__kicker">Dishpute</p>
      <h1 className="page-header__title">Sign in</h1>
      {clerkEnabled ? (
        <SignInPanel />
      ) : (
        <article className="note-card">
          <p>
            Clerk keys are not in this environment, so the dashboard stays in
            local demo mode. Add these to <code>.env.local</code> from a Clerk
            development instance (free tier is enough for early testing):
          </p>
          <pre className="dispute-body">{`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...`}</pre>
          <p>
            Then restart the dev server. Until then you can still{" "}
            <Link href="/dashboard">open the sample week</Link>.
          </p>
        </article>
      )}
    </main>
  );
}
