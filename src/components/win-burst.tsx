"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCents } from "@/domain/money";

export function WinBurst({ recoveredCents }: { recoveredCents: number }) {
  const router = useRouter();
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShow(false);
      router.replace(window.location.pathname);
    }, 2400);
    return () => window.clearTimeout(timer);
  }, [router]);

  if (!show || recoveredCents <= 0) {
    return null;
  }

  return (
    <div className="win-burst" role="status">
      <div className="win-burst__confetti" aria-hidden="true" />
      <p className="win-burst__copy">Refund received · {formatCents(recoveredCents)} recovered</p>
    </div>
  );
}
