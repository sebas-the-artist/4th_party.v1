"use client";

import { useState } from "react";
import { CopyDispute } from "@/components/copy-dispute";

export function DisputeTools({
  matchId,
  subject,
  body,
  toEmail,
  blocked,
}: {
  matchId: string;
  subject: string;
  body: string;
  toEmail: string;
  blocked?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const mailto = `mailto:${encodeURIComponent(toEmail || "")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  function download() {
    const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${subject.replace(/[^\w]+/g, "-").slice(0, 40)}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function share() {
    const payload = `${subject}\n\n${body}`;
    if (navigator.share) {
      await navigator.share({ title: subject, text: payload });
      return;
    }
    await navigator.clipboard.writeText(payload);
    setCopied(true);
  }

  return (
    <div className="ingest-form__footer">
      <CopyDispute matchId={matchId} body={body} blocked={blocked} />
      {blocked ? (
        <button className="button button--ghost" type="button" disabled>
          Open in your mail app
        </button>
      ) : (
        <a className="button button--ghost" href={mailto}>
          Open in your mail app
        </a>
      )}
      <button className="button button--ghost" type="button" onClick={download} disabled={blocked}>
        Download draft
      </button>
      <button
        className="button button--ghost"
        type="button"
        onClick={() => void share()}
        disabled={blocked}
      >
        {copied ? "Copied to share" : "Forward"}
      </button>
    </div>
  );
}
