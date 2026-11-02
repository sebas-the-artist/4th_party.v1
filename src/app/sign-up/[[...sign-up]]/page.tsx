import Link from "next/link";
import { clerkKeysReady } from "@/lib/clerk-env";
import { SignUpPanel } from "@/components/sign-up-panel";

export default function SignUpPage() {
  return (
    <main className="auth-page">
      <p className="page-header__kicker">Dishpute</p>
      <h1 className="page-header__title">Create an account</h1>
      {clerkKeysReady() ? (
        <SignUpPanel />
      ) : (
        <p>
          Sign up is not connected yet. <Link href="/sign-in">Back to sign in</Link>.
        </p>
      )}
    </main>
  );
}
