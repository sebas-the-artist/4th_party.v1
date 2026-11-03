import type { Location, Workspace } from "@/domain/types";

export type SetupStepId = "location" | "pos" | "delivery" | "bank" | "run";

export type SetupStep = {
  id: SetupStepId;
  done: boolean;
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
};

export function setupProgress(workspace: Workspace, location?: Location): SetupProgress {
  const loc = location ?? workspace.locations[0];
  const sources = workspace.sources.filter((source) => !loc || source.locationId === loc.id);
  const hasLocation = workspace.locations.length > 0;
  const hasPos = sources.some((source) => source.kind === "pos" && source.connected);
  const hasDelivery = sources.some((source) => source.kind === "delivery" && source.connected);
  const hasBank = sources.some((source) => source.kind === "bank" && source.connected);
  const hasRun = Boolean(loc && workspace.runs.some((run) => run.locationId === loc.id));
  const readyToMatch = hasLocation && hasPos && hasDelivery && hasBank;

  const steps: SetupStep[] = [
    {
      id: "location",
      done: hasLocation,
      title: "Add a store",
      hint: "Name and address is enough. Store number is optional.",
      href: "/dashboard/locations",
      cta: "Add a store",
    },
    {
      id: "pos",
      done: hasPos,
      title: "Connect the POS",
      hint: "Toast, Square, or Clover — this is the ticket that proves the food was made.",
      href: "/dashboard/integrations",
      cta: "Connect POS",
    },
    {
      id: "delivery",
      done: hasDelivery,
      title: "Connect DoorDash, Uber, or Grubhub",
      hint: "Turn on every app that store actually uses. Skip the ones you do not.",
      href: "/dashboard/integrations",
      cta: "Connect apps",
    },
    {
      id: "bank",
      done: hasBank,
      title: "Connect bank deposits",
      hint: "The payout has to land in the restaurant account or it is not a match.",
      href: "/dashboard/integrations",
      cta: "Connect bank",
    },
    {
      id: "run",
      done: hasRun,
      title: "Run a week",
      hint: "Paste last week’s POS, delivery, and bank CSVs. Then we show what is still owed.",
      href: "/dashboard/reconciliations/new",
      cta: "Run a week",
    },
  ];

  return {
    location: loc,
    steps,
    next: steps.find((step) => !step.done),
    complete: steps.every((step) => step.done),
    readyToMatch,
  };
}

export const MEMBERSHIP_CENTS_PER_LOCATION = 4900;
export const RECOVERY_FEE_BPS = 1000;

export function recoveryFeeCents(recoveredCents: number): number {
  return Math.round((recoveredCents * RECOVERY_FEE_BPS) / 10000);
}

export function membershipCents(locationCount: number): number {
  return locationCount * MEMBERSHIP_CENTS_PER_LOCATION;
}
