import { cookies } from "next/headers";
import type { Location, Workspace } from "@/domain/types";

export const STORE_COOKIE = "fp_store";

export async function readStoreCookie(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(STORE_COOKIE)?.value;
}

export async function writeStoreCookie(locationId: string) {
  const jar = await cookies();
  jar.set(STORE_COOKIE, locationId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
}

export function locationById(workspace: Workspace, locationId?: string): Location | undefined {
  if (locationId) {
    const match = workspace.locations.find((location) => location.id === locationId);
    if (match) {
      return match;
    }
  }
  return workspace.locations[0];
}

export async function getActiveLocation(workspace: Workspace): Promise<Location | undefined> {
  return locationById(workspace, await readStoreCookie());
}

export function scopeWorkspace(workspace: Workspace, locationId: string): Workspace {
  const take = <T extends { locationId: string }>(rows: T[]) =>
    rows.filter((row) => row.locationId === locationId);

  return {
    ...workspace,
    locations: workspace.locations.filter((location) => location.id === locationId),
    sources: take(workspace.sources),
    posOrders: take(workspace.posOrders),
    deliveryItems: take(workspace.deliveryItems),
    bankDeposits: take(workspace.bankDeposits),
    runs: take(workspace.runs),
    matches: take(workspace.matches),
    disputes: workspace.disputes.filter((dispute) => {
      if (dispute.locationId) {
        return dispute.locationId === locationId;
      }
      const match = workspace.matches.find((item) => item.id === dispute.matchId);
      return match?.locationId === locationId;
    }),
  };
}
