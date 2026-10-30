"use client";

import { useRef, type ReactNode } from "react";

export function LiveFilterForm({
  action,
  children,
}: {
  action: string;
  children: ReactNode;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const timerRef = useRef<number>(0);

  return (
    <form
      ref={formRef}
      className="filter-bar"
      action={action}
      method="get"
      onChange={(event) => {
        const field = event.target;
        if (!(field instanceof HTMLSelectElement) && !(field instanceof HTMLInputElement)) {
          return;
        }
        window.clearTimeout(timerRef.current);
        const delay = field instanceof HTMLSelectElement ? 0 : 280;
        timerRef.current = window.setTimeout(() => {
          formRef.current?.requestSubmit();
        }, delay);
      }}
    >
      {children}
      <button className="sr-only" type="submit">
        Apply filters
      </button>
    </form>
  );
}
