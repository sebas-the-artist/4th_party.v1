import type { Location, Workspace } from "@/domain/types";

export type SetupStepId = "location" | "delivery" | "run" | "pos" | "bank";

export type SetupStep = {
  id: SetupStepId;
  done: boolean;
  optional?: boolean;
  title: string;
  hint: string;
  href: string;
  cta: string;
};

export type SetupProgress = {
  location?: Location;
  steps: SetupStep[];
  next?: SetupStep;
  complete: boolean;
  readyToMatch: boolean;
  hasRun: boolean;
};

export function setupProgress(workspace: Workspace, location?: Location): SetupProgress {
  const loc = location ?? workspace.locations[0];
  const sources = workspace.sources.filter((source) => !loc || source.locationId === loc.id);
  const hasLocation = workspace.locations.length > 0;
  const hasPos = sources.some((source) => source.kind === "pos" && source.connected);
  const hasDelivery = sources.some((source) => source.kind === "delivery" && source.connected);
  const hasBank = sources.some((source) => source.kind === "bank" && source.connected);
  const hasRun = Boolean(loc && workspace.runs.some((run) => run.locationId === loc.id));
  const readyToMatch = hasLocation && hasDelivery;

  const steps: SetupStep[] = [
    {
      id: "location",
      done: hasLocation,
      title: "Add a store",
      hint: "Name and street is enough.",
      href: "/dashboard/locations",
      cta: "Add a store",
    },
    {
      id: "delivery",
      done: hasDelivery,
      title: "Turn on DoorDash, Uber, or Grubhub",
      hint: "Flip the apps that store actually sells on. That unlocks the payout upload.",
      href: "/dashboard/integrations",
      cta: "Turn on apps",
    },
    {
      id: "run",
      done: hasRun,
      title: "Drop the payout file as soon as it exists",
      hint: "Do not wait for Sunday. Platforms give about 30 days. Every idle day is a day you cannot get back.",
      href: "/dashboard/reconciliations/new",
      cta: "Upload payout",
    },
    {
      id: "pos",
      done: hasPos,
      optional: true,
      title: "Optional: POS tickets",
      hint: "Toast / Square export proves the food was made. Stronger letters. Not required to start.",
      href: "/dashboard/integrations",
      cta: "Add POS",
    },
    {
      id: "bank",
      done: hasBank,
      optional: true,
      title: "Optional: bank deposits",
      hint: "Use this when you want to prove the payout never landed. Also not a gate.",
      href: "/dashboard/integrations",
      cta: "Add bank",
    },
  ];

  return {
    location: loc,
    steps,
    next: steps.find((step) => !step.done && !step.optional),
    complete: steps.filter((step) => !step.optional).every((step) => step.done),
    readyToMatch,
    hasRun,
  };
}

export const MEMBERSHIP_FIRST_CENTS = 3900;
export const MEMBERSHIP_ADDITIONAL_CENTS = 2900;
export const RECOVERY_FEE_BPS = 1000;
export const DISPUTE_WINDOW_DAYS = 30;

export function recoveryFeeCents(recoveredCents: number): number {
  return Math.round((recoveredCents * RECOVERY_FEE_BPS) / 10000);
}

export function membershipCents(locationCount: number): number {
  if (locationCount <= 0) {
    return 0;
  }
  return MEMBERSHIP_FIRST_CENTS + Math.max(0, locationCount - 1) * MEMBERSHIP_ADDITIONAL_CENTS;
}

export function disputeDaysLeft(iso?: string, now = Date.now()): number | undefined {
  if (!iso) {
    return undefined;
  }
  const start = Date.parse(iso);
  if (Number.isNaN(start)) {
    return undefined;
  }
  const elapsedDays = Math.floor((now - start) / (24 * 60 * 60 * 1000));
  return Math.max(0, DISPUTE_WINDOW_DAYS - elapsedDays);
}
