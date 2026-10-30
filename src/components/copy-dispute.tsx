"use client";

import { useState } from "react";
import { copyDisputeAction } from "@/app/(dashboard)/dashboard/actions";

export function CopyDispute({
  matchId,
  body,
  blocked,
}: {
  matchId: string;
  body: string;
  blocked?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <form
      action={async (formData) => {
        if (blocked) {
          return;
        }
        try {
          await navigator.clipboard.writeText(body);
          setCopied(true);
        } catch {
          setCopied(false);
        }
        await copyDisputeAction(formData);
      }}
    >
      <input type="hidden" name="matchId" value={matchId} />
      <button className="button button--ghost" type="submit" disabled={blocked}>
        {copied ? "Copied" : "Copy letter"}
      </button>
    </form>
  );
}
