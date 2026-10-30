"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import { clerkEnabled } from "@/lib/config";

export function AccountMenu() {
  if (!clerkEnabled) {
    return <p className="side-dock__demo">Local demo · sign-in keys not set</p>;
  }

  return <AccountMenuLoaded />;
}

function AccountMenuLoaded() {
  const { isSignedIn } = useAuth();
  if (!isSignedIn) {
    return null;
  }
  return (
    <div className="account-menu">
      <UserButton
        appearance={{
          elements: {
            avatarBox: { width: "2.75rem", height: "2.75rem" },
            userButtonAvatarBox: { width: "2.75rem", height: "2.75rem" },
            userButtonTrigger: { width: "2.75rem", height: "2.75rem" },
          },
        }}
      />
    </div>
  );
}
