import Link from "next/link";
import { clerkEnabled } from "@/lib/config";
import { SignUpPanel } from "@/components/sign-up-panel";

export default function SignUpPage() {
  return (
    <main className="auth-page">
      <p className="page-header__kicker">4th Party</p>
      <h1 className="page-header__title">Create an account</h1>
      {clerkEnabled ? (
        <SignUpPanel />
      ) : (
        <p>
          Clerk is not configured yet. <Link href="/sign-in">Back to sign in</Link>.
        </p>
      )}
    </main>
  );
}
