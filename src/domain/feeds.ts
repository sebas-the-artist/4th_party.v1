import type { Source } from "@/domain/types";

function id(locationId: string, key: string) {
  return `src_${key}_${locationId}`;
}

export function defaultSourcesForLocation(locationId: string): Source[] {
  return [
    {
      id: id(locationId, "pos"),
      locationId,
      kind: "pos",
      label: "POS (Toast, Square, or Clover)",
      maskedCredential: "not connected",
      connected: false,
    },
    {
      id: id(locationId, "doordash"),
      locationId,
      kind: "delivery",
      label: "DoorDash",
      platform: "doordash",
      commissionBps: 2500,
      maskedCredential: "not connected",
      connected: false,
      supportEmail: "merchant-support@doordash.example",
    },
    {
      id: id(locationId, "uber"),
      locationId,
      kind: "delivery",
      label: "Uber Eats",
      platform: "uber_eats",
      commissionBps: 3000,
      maskedCredential: "not connected",
      connected: false,
      supportEmail: "restaurants@uber.example",
    },
    {
      id: id(locationId, "grubhub"),
      locationId,
      kind: "delivery",
      label: "Grubhub",
      platform: "grubhub",
      commissionBps: 2500,
      maskedCredential: "not connected",
      connected: false,
      supportEmail: "partners@grubhub.example",
    },
    {
      id: id(locationId, "bank"),
      locationId,
      kind: "bank",
      label: "Bank deposits",
      maskedCredential: "not connected",
      connected: false,
    },
  ];
}

export function ensureLocationSources<T extends { locations: { id: string }[]; sources: Source[] }>(
  workspace: T,
): T {
  const extra: Source[] = [];
  for (const location of workspace.locations) {
    if (!workspace.sources.some((source) => source.locationId === location.id)) {
      extra.push(...defaultSourcesForLocation(location.id));
    }
  }
  if (extra.length === 0) {
    return workspace;
  }
  return { ...workspace, sources: [...workspace.sources, ...extra] };
}
