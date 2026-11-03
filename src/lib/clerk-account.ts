import type { ContactProfile, Location, Source } from "@/domain/types";
import { EMPTY_CONTACT } from "@/domain/types";
import { clerkKeysReady } from "@/lib/clerk-env";

const META_KEY = "dishputeAccount";

export type AccountSlice = {
  contact: ContactProfile;
  locations: Location[];
  sources: Source[];
};

function asSlice(raw: unknown): AccountSlice | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const value = raw as Partial<AccountSlice>;
  if (!Array.isArray(value.locations) || !Array.isArray(value.sources)) {
    return null;
  }
  return {
    contact: value.contact ?? EMPTY_CONTACT,
    locations: value.locations,
    sources: value.sources,
  };
}

export async function loadClerkAccount(ownerId: string): Promise<AccountSlice | null> {
  if (ownerId === "demo" || !clerkKeysReady()) {
    return null;
  }
  try {
    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();
    const user = await client.users.getUser(ownerId);
    return asSlice(user.privateMetadata[META_KEY]);
  } catch {
    return null;
  }
}

export async function saveClerkAccount(ownerId: string, slice: AccountSlice): Promise<void> {
  if (ownerId === "demo" || !clerkKeysReady()) {
    return;
  }
  const packed = JSON.stringify(slice);
  if (packed.length > 7000) {
    return;
  }
  try {
    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();
    const user = await client.users.getUser(ownerId);
    await client.users.updateUserMetadata(ownerId, {
      privateMetadata: {
        ...user.privateMetadata,
        [META_KEY]: slice,
      },
    });
  } catch {
    // Keep the request alive even if Clerk metadata is full or unavailable.
  }
}
