"use client";

import Link from "next/link";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { clerkEnabled, showPublicDemo } from "@/lib/config";

export function LandingHeroActions() {
  if (!clerkEnabled) {
    return (
      <div className="landing-hero__actions">
        <a className="button button--primary" href="#waitlist">
          Save me a seat
        </a>
        <Link className="button button--ghost" href="/sign-in">
          Sign in
        </Link>
        {showPublicDemo ? (
          <Link className="button button--ghost" href="/dashboard">
            Open the sample week
          </Link>
        ) : null}
      </div>
    );
  }

  return <LandingHeroActionsLoaded />;
}

function LandingHeroActionsLoaded() {
  const { isSignedIn } = useAuth();

  return (
    <div className="landing-hero__actions">
      <a className="button button--primary" href="#waitlist">
        Save me a seat
      </a>
      {isSignedIn ? (
        <Link className="button button--ghost" href="/dashboard">
          Open dashboard
        </Link>
      ) : (
        <>
          <SignInButton mode="redirect">
            <button className="button button--ghost" type="button">
              Sign in
            </button>
          </SignInButton>
          {showPublicDemo ? (
            <Link className="button button--ghost" href="/dashboard">
              Open the sample week
            </Link>
          ) : null}
        </>
      )}
    </div>
  );
}
