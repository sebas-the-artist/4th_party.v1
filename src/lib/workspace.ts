import { parseBankCsv, parseDeliveryCsv, parsePosCsv } from "@/domain/csv";
import {
  buildDisputeText,
  disputeSubject,
  hasLetterBlanks,
  stampSignature,
  supportEmailFor,
} from "@/domain/disputes";
import { runMatchingEngine } from "@/domain/engine";
import { formatCents } from "@/domain/money";
import { addLocationSchema, contactSchema, csvTextSchema, waitlistSchema } from "@/domain/schemas";
import {
  EMPTY_CONTACT,
  type ContactProfile,
  type DisputeStatus,
  type Location,
  type MatchRecord,
  type MatchStatus,
  type Platform,
  type Workspace,
} from "@/domain/types";
import { matchStatusLabel, platformLabel } from "@/domain/types";
import { currentOwnerId, currentUserProfile } from "@/lib/auth";
import { buildDemoWorkspace } from "@/lib/demo-seed";
import { sanitizeEmail } from "@/lib/security";
import { getActiveLocation, scopeWorkspace } from "@/lib/store-context";
import { insertWaitlistRow, loadWorkspace, saveWorkspace, updateWorkspace } from "@/lib/store";

function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`;
}

function applyGoodBurgerBrand(workspace: Workspace): Workspace {
  const raw = JSON.stringify(workspace);
  if (!raw.includes("Harbor Slice")) {
    return workspace;
  }
  return JSON.parse(raw.replaceAll("Harbor Slice", "Good Burger")) as Workspace;
}

function scrubProductNameFromLetters(workspace: Workspace): Workspace {
  const needle = "4th Party";
  const hit =
    workspace.disputes.some((dispute) => dispute.body.includes(needle)) ||
    workspace.matches.some((match) => match.disputeText.includes(needle));
  if (!hit) {
    return workspace;
  }

  const clean = (text: string) =>
    text
      .replaceAll(" from the 4th Party three-way match (POS, payout, bank)", " from POS, payout, and bank records")
      .replaceAll("4th Party three-way match", "POS, payout, and bank records")
      .replaceAll("4th Party", "our restaurant records");

  return {
    ...workspace,
    matches: workspace.matches.map((match) => ({
      ...match,
      disputeText: clean(match.disputeText),
    })),
    disputes: workspace.disputes.map((dispute) => {
      if (dispute.status !== "ready" && dispute.status !== "draft") {
        return dispute;
      }
      return { ...dispute, body: clean(dispute.body) };
    }),
  };
}

function storeNameFor(workspace: Workspace, locationId?: string): string {
  return workspace.locations.find((item) => item.id === locationId)?.name ?? "[Business name]";
}

function withContact(workspace: Workspace, contact: ContactProfile): Workspace {
  const hasValues = Boolean(contact.name || contact.title || contact.phone || contact.email);
  if (!hasValues) {
    return { ...workspace, contact };
  }
  const stampedAt = new Date().toISOString();
  return {
    ...workspace,
    contact,
    matches: workspace.matches.map((match) => ({
      ...match,
      disputeText: stampSignature(
        match.disputeText,
        contact,
        storeNameFor(workspace, match.locationId),
      ),
    })),
    disputes: workspace.disputes.map((dispute) => {
      if (dispute.status !== "ready" && dispute.status !== "draft") {
        return dispute;
      }
      const body = stampSignature(
        dispute.body,
        contact,
        storeNameFor(workspace, dispute.locationId),
      );
      return {
        ...dispute,
        body,
        updatedAt: body === dispute.body ? dispute.updatedAt : stampedAt,
      };
    }),
  };
}

function refreshLegacyDisputeCopy(workspace: Workspace): Workspace {
  const stale = workspace.disputes.some(
    (dispute) =>
      (dispute.status === "ready" || dispute.status === "draft") &&
      !dispute.body.includes("Hello "),
  );
  if (!stale) {
    return workspace;
  }

  const matches = workspace.matches.map((match) => {
    const location = workspace.locations.find((item) => item.id === match.locationId);
    const pos = workspace.posOrders.find((item) => item.id === match.posOrderId);
    const delivery = workspace.deliveryItems.find((item) => item.id === match.deliveryItemId);
    return {
      ...match,
      disputeText: buildDisputeText({
        match,
        pos,
        delivery,
        location,
        contact: workspace.contact,
      }),
    };
  });

  return {
    ...workspace,
    matches,
    disputes: workspace.disputes.map((dispute) => {
      if (dispute.status !== "ready" && dispute.status !== "draft") {
        return dispute;
      }
      if (dispute.body.includes("Hello ")) {
        return dispute;
      }
      const match = matches.find((item) => item.id === dispute.matchId);
      if (!match) {
        return dispute;
      }
      return {
        ...dispute,
        body: match.disputeText,
        subject: disputeSubject(match.disputeText),
      };
    }),
  };
}

export async function getWorkspace(): Promise<Workspace> {
  const ownerId = await currentOwnerId();
  const workspace = await loadWorkspace(ownerId);
  const needsDemoUpgrade =
    ownerId === "demo" &&
    (workspace.locations.length === 0 ||
      workspace.locations.some((location) => !location.address || location.storeNumber === "000"));
  if (needsDemoUpgrade) {
    const seeded = buildDemoWorkspace(ownerId);
    seeded.waitlist = workspace.waitlist;
    seeded.contact = workspace.contact ?? EMPTY_CONTACT;
    const filled = withContact(seeded, seeded.contact);
    await saveWorkspace(filled);
    return filled;
  }

  const stored = workspace.contact ?? EMPTY_CONTACT;
  const hasSavedContact = Boolean(stored.name || stored.title || stored.phone || stored.email);
  const profile = await currentUserProfile();
  const contact: ContactProfile = hasSavedContact
    ? stored
    : { ...EMPTY_CONTACT, name: profile.name, email: profile.email };
  const next = withContact(
    refreshLegacyDisputeCopy(
      scrubProductNameFromLetters(applyGoodBurgerBrand({ ...workspace, contact })),
    ),
    contact,
  );
  if (JSON.stringify(next) !== JSON.stringify(workspace)) {
    await saveWorkspace(next);
    return next;
  }
  return workspace;
}

export async function getScopedWorkspace(): Promise<{
  workspace: Workspace;
  scoped: Workspace;
  location: Location | undefined;
}> {
  const workspace = await getWorkspace();
  const location = await getActiveLocation(workspace);
  const scoped = location ? scopeWorkspace(workspace, location.id) : workspace;
  return { workspace, scoped, location };
}

export async function resetDemoWorkspace() {
  const ownerId = await currentOwnerId();
  const current = await loadWorkspace(ownerId);
  const seeded = buildDemoWorkspace(ownerId);
  seeded.waitlist = current.waitlist;
  seeded.contact = current.contact ?? EMPTY_CONTACT;
  const filled = withContact(seeded, seeded.contact);
  await saveWorkspace(filled);
  return filled;
}

export type StoreHealth = "matched" | "needs_attention" | "active";

export function storeHealth(workspace: Workspace, locationId: string): StoreHealth {
  const matches = workspace.matches.filter((match) => match.locationId === locationId);
  if (matches.length === 0) {
    return "active";
  }
  if (matches.some((match) => match.status !== "matched")) {
    return "needs_attention";
  }
  return "matched";
}

export function storeHealthLabel(status: StoreHealth): string {
  if (status === "needs_attention") return "Needs attention";
  if (status === "matched") return "Matched";
  return "Active";
}

export type ExceptionRow = {
  id: string;
  runId: string;
  store: string;
  platform: string;
  platformKey: MatchRecord["platform"];
  status: MatchStatus;
  statusLabel: string;
  variance: string;
  varianceCents: number;
  recoveredCents: number;
  summary: string;
};

export function exceptionRows(workspace: Workspace): ExceptionRow[] {
  const locationName = (id: string) =>
    workspace.locations.find((location) => location.id === id)?.name ?? "Unknown store";

  return workspace.matches
    .filter((match) => match.status !== "matched")
    .map((match) => ({
      id: match.id,
      runId: match.runId,
      store: locationName(match.locationId),
      platform: platformLabel(match.platform),
      platformKey: match.platform,
      status: match.status,
      statusLabel: matchStatusLabel(match.status),
      variance: formatCents(match.varianceCents),
      varianceCents: match.varianceCents,
      recoveredCents: match.recoveredCents,
      summary: match.summary,
    }));
}

export function dashboardSummary(workspace: Workspace) {
  const exceptions = exceptionRows(workspace);
  const latestRun = workspace.runs[0];
  const matchedCount = workspace.matches.filter((match) => match.status === "matched").length;
  const total = workspace.matches.length;
  const netVarianceCents = exceptions.reduce((totalVariance, row) => totalVariance + row.varianceCents, 0);
  const recoveredCents = workspace.matches.reduce((sum, match) => sum + match.recoveredCents, 0);
  const location = workspace.locations[0];

  return {
    location,
    locationName: location?.name ?? "No location",
    city: location?.city ?? "",
    latestRun,
    totalMatches: total,
    openExceptions: exceptions.length,
    matchedRate: total === 0 ? 0 : Math.round((matchedCount / total) * 100),
    netVarianceCents,
    netVariance: formatCents(netVarianceCents),
    recoveredCents,
    recovered: formatCents(recoveredCents),
    attention: exceptions.slice(0, 6),
  };
}

export type LocationCard = {
  location: Location;
  health: StoreHealth;
  healthLabel: string;
  platforms: string[];
  openDiscrepancies: number;
  matchedRate: number;
  active: boolean;
};

export function locationCards(workspace: Workspace, activeId?: string): LocationCard[] {
  return workspace.locations.map((location) => {
    const matches = workspace.matches.filter((match) => match.locationId === location.id);
    const open = matches.filter((match) => match.status !== "matched").length;
    const health = storeHealth(workspace, location.id);
    const platforms = workspace.sources
      .filter((source) => source.locationId === location.id && source.kind === "delivery" && source.connected)
      .map((source) => platformLabel(source.platform ?? "doordash"));
    return {
      location,
      health,
      healthLabel: storeHealthLabel(health),
      platforms,
      openDiscrepancies: open,
      matchedRate:
        matches.length === 0 ? 0 : Math.round(((matches.length - open) / matches.length) * 100),
      active: location.id === activeId,
    };
  });
}

export async function addWaitlistEntry(input: { email: string; restaurant: string }) {
  const parsed = waitlistSchema.parse({
    email: sanitizeEmail(input.email),
    restaurant: input.restaurant,
  });

  const workspace = await updateWorkspace("demo", (current) => {
    const already = current.waitlist.some((entry) => entry.email === parsed.email);
    if (already) {
      return current;
    }
    return {
      ...current,
      waitlist: [
        ...current.waitlist,
        {
          id: createId("wtl"),
          email: parsed.email,
          restaurant: parsed.restaurant,
          createdAt: new Date().toISOString(),
        },
      ],
    };
  });

  const saved = workspace.waitlist.find((entry) => entry.email === parsed.email);
  if (saved) {
    await insertWaitlistRow(saved);
  }
  return saved;
}

export async function addLocation(input: unknown) {
  const parsed = addLocationSchema.parse(input);
  const ownerId = await currentOwnerId();
  const location: Location = {
    id: createId("loc"),
    name: parsed.name,
    storeNumber: parsed.storeNumber.replace(/^#/, ""),
    address: parsed.address,
    city: parsed.city,
    state: parsed.state.toUpperCase(),
    postalCode: parsed.postalCode,
    billingActive: true,
  };

  await updateWorkspace(ownerId, (workspace) => ({
    ...workspace,
    locations: [...workspace.locations, location],
  }));

  return location;
}

export async function runFromCsv(input: {
  locationId: string;
  periodStart: string;
  periodEnd: string;
  posCsv: string;
  deliveryCsv: string;
  bankCsv: string;
}) {
  const parsed = csvTextSchema.parse(input);
  const runId = createId("run");
  const ownerId = await currentOwnerId();

  return updateWorkspace(ownerId, (workspace) => {
    const location = workspace.locations.find((item) => item.id === parsed.locationId);
    if (!location) {
      throw new Error("Unknown location.");
    }

    const posOrders = parsePosCsv(parsed.posCsv, parsed.locationId);
    const deliveryItems = parseDeliveryCsv(parsed.deliveryCsv, parsed.locationId);
    const bankDeposits = parseBankCsv(parsed.bankCsv, parsed.locationId);
    const matches = runMatchingEngine({
      runId,
      locationId: parsed.locationId,
      location,
      contact: workspace.contact,
      sources: workspace.sources.filter((source) => source.locationId === parsed.locationId),
      posOrders,
      deliveryItems,
      bankDeposits,
    });

    const netVarianceCents = matches
      .filter((match) => match.status !== "matched")
      .reduce((total, match) => total + match.varianceCents, 0);

    const createdAt = new Date().toISOString();
    const sources = workspace.sources.filter((source) => source.locationId === parsed.locationId);

    return {
      ...workspace,
      posOrders: [...workspace.posOrders, ...posOrders],
      deliveryItems: [...workspace.deliveryItems, ...deliveryItems],
      bankDeposits: [...workspace.bankDeposits, ...bankDeposits],
      runs: [
        {
          id: runId,
          locationId: parsed.locationId,
          periodStart: parsed.periodStart,
          periodEnd: parsed.periodEnd,
          status: "complete",
          netVarianceCents,
          createdAt,
        },
        ...workspace.runs,
      ],
      matches: [...matches, ...workspace.matches],
      disputes: [
        ...matches
          .filter((match) => match.status !== "matched")
          .map((match) => ({
            id: createId("dsp"),
            matchId: match.id,
            runId,
            locationId: parsed.locationId,
            status: "ready" as const,
            subject: disputeSubject(match.disputeText),
            body: match.disputeText,
            toEmail: supportEmailFor(sources, match.platform),
            updatedAt: createdAt,
          })),
        ...workspace.disputes,
      ],
    };
  });
}

export function getMatchDetail(workspace: Workspace, matchId: string) {
  const match = workspace.matches.find((item) => item.id === matchId);
  if (!match) {
    return null;
  }
  const location = workspace.locations.find((item) => item.id === match.locationId);
  const pos = workspace.posOrders.find((item) => item.id === match.posOrderId);
  const delivery = workspace.deliveryItems.find((item) => item.id === match.deliveryItemId);
  const deposit = workspace.bankDeposits.find((item) => item.id === match.bankDepositId);
  const dispute = workspace.disputes.find((item) => item.matchId === match.id);
  const run = workspace.runs.find((item) => item.id === match.runId);

  return { match, location, pos, delivery, deposit, dispute, run };
}

export async function markDispute(matchId: string, status: DisputeStatus) {
  const ownerId = await currentOwnerId();
  return updateWorkspace(ownerId, (workspace) => ({
    ...workspace,
    disputes: workspace.disputes.map((dispute) => {
      if (dispute.matchId !== matchId) {
        return dispute;
      }
      const blocked =
        hasLetterBlanks(dispute.body) &&
        (status === "ready" || status === "sent" || status === "awaiting");
      return {
        ...dispute,
        status: blocked ? "draft" : status,
        updatedAt: new Date().toISOString(),
      };
    }),
  }));
}

export async function saveContact(input: ContactProfile) {
  const parsed = contactSchema.parse(input);
  const ownerId = await currentOwnerId();
  return updateWorkspace(ownerId, (workspace) => withContact(workspace, parsed));
}

export async function saveDisputeDraft(input: {
  disputeId: string;
  body: string;
  subject: string;
  toEmail: string;
  status: DisputeStatus;
}) {
  const ownerId = await currentOwnerId();
  const blocked =
    hasLetterBlanks(input.body) &&
    (input.status === "ready" || input.status === "sent" || input.status === "awaiting");
  return updateWorkspace(ownerId, (workspace) => ({
    ...workspace,
    disputes: workspace.disputes.map((dispute) =>
      dispute.id === input.disputeId
        ? {
            ...dispute,
            body: input.body,
            subject: input.subject,
            toEmail: input.toEmail,
            status: blocked ? "draft" : input.status,
            updatedAt: new Date().toISOString(),
          }
        : dispute,
    ),
  }));
}

export async function resolveMatch(matchId: string, outcome: "approved" | "denied" = "approved") {
  const ownerId = await currentOwnerId();
  return updateWorkspace(ownerId, (workspace) => {
    const current = workspace.matches.find((match) => match.id === matchId);
    const recovered = current ? Math.abs(current.varianceCents) : 0;
    return {
      ...workspace,
      matches: workspace.matches.map((match) =>
        match.id === matchId
          ? outcome === "approved"
            ? {
                ...match,
                status: "matched" as const,
                summary: `Refund received. Recovered ${formatCents(recovered)}.`,
                recoveredCents: recovered,
                varianceCents: 0,
                receivedCents: match.expectedCents,
              }
            : {
                ...match,
                summary: "Refund denied. Needs follow-up with the platform.",
              }
          : match,
      ),
      disputes: workspace.disputes.map((dispute) =>
        dispute.matchId === matchId
          ? {
              ...dispute,
              status: outcome === "approved" ? ("approved" as const) : ("denied" as const),
              updatedAt: new Date().toISOString(),
            }
          : dispute,
      ),
    };
  });
}

export function sourceCards(workspace: Workspace) {
  return workspace.sources.map((source) => ({
    ...source,
    locationName:
      workspace.locations.find((location) => location.id === source.locationId)?.name ?? "",
  }));
}

export async function toggleSource(sourceId: string) {
  const ownerId = await currentOwnerId();
  return updateWorkspace(ownerId, (workspace) => ({
    ...workspace,
    sources: workspace.sources.map((source) =>
      source.id === sourceId ? { ...source, connected: !source.connected } : source,
    ),
  }));
}

export function latestRunMatches(workspace: Workspace): MatchRecord[] {
  const latest = workspace.runs[0];
  if (!latest) {
    return [];
  }
  return workspace.matches.filter((match) => match.runId === latest.id);
}

export function filterMatches(
  matches: MatchRecord[],
  filters: {
    platform?: string;
    status?: string;
    query?: string;
  },
) {
  return matches.filter((match) => {
    if (filters.platform && filters.platform !== "all") {
      if (filters.platform === "other") {
        if (match.platform === "doordash" || match.platform === "uber_eats" || match.platform === "grubhub") {
          return false;
        }
      } else if (match.platform !== filters.platform) {
        return false;
      }
    }
    if (filters.status && filters.status !== "all" && match.status !== filters.status) {
      return false;
    }
    if (filters.query) {
      const haystack = `${match.summary} ${match.disputeText} ${match.platform}`.toLowerCase();
      if (!haystack.includes(filters.query.toLowerCase())) {
        return false;
      }
    }
    return true;
  });
}

export function connectedPlatforms(workspace: Workspace): Platform[] {
  const set = new Set<Platform>();
  for (const source of workspace.sources) {
    if (source.kind === "delivery" && source.connected && source.platform) {
      set.add(source.platform);
    }
  }
  return [...set];
}
