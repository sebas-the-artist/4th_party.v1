import { formatCents } from "@/domain/money";
import type { DeliveryItem, MatchRecord, Workspace } from "@/domain/types";

export const RECOVERY_EVIDENCE = ["none", "merchant", "payout", "bank"] as const;
export type RecoveryEvidence = (typeof RECOVERY_EVIDENCE)[number];

export function isBillableRecovery(match: Pick<MatchRecord, "recoveredCents" | "recoveryEvidence">) {
  return match.recoveredCents > 0 && (match.recoveryEvidence === "payout" || match.recoveryEvidence === "bank");
}

export function deliveryFingerprint(item: Pick<DeliveryItem, "orderId" | "soldAt" | "netCents" | "adjustmentCents">) {
  return `${item.orderId}|${item.soldAt}|${item.netCents}|${item.adjustmentCents}`;
}

export function looksLikeReversal(item: DeliveryItem) {
  const hay = `${item.status} ${item.adjustmentReason}`.toLowerCase();
  if (/revers|reinstat|dispute approved|charge reversed|clawback reversed/.test(hay)) {
    return true;
  }
  return item.adjustmentCents > 0 && item.netCents > 0;
}

function reversalAmount(item: DeliveryItem) {
  if (item.adjustmentCents > 0) {
    return item.adjustmentCents;
  }
  return Math.max(item.netCents, 0);
}

export function confirmRecoveriesFromPayout(
  workspace: Workspace,
  incoming: DeliveryItem[],
): Workspace {
  const seen = new Set(workspace.deliveryItems.map(deliveryFingerprint));
  const fresh = incoming.filter((item) => !seen.has(deliveryFingerprint(item)) && looksLikeReversal(item));
  if (fresh.length === 0) {
    return workspace;
  }

  const orderByDeliveryId = new Map(workspace.deliveryItems.map((item) => [item.id, item.orderId]));
  const used = new Set<string>();

  const matches = workspace.matches.map((match) => {
    if (match.status === "matched" && isBillableRecovery(match)) {
      return match;
    }
    if (match.platform === "bank") {
      return match;
    }
    const orderId = match.deliveryItemId ? orderByDeliveryId.get(match.deliveryItemId) : undefined;
    if (!orderId) {
      return match;
    }
    const reversal = fresh.find((item) => item.orderId === orderId && !used.has(item.id));
    if (!reversal) {
      return match;
    }
    used.add(reversal.id);
    const recovered = Math.min(Math.abs(match.varianceCents) || match.recoveredCents || reversalAmount(reversal), reversalAmount(reversal) || Math.abs(match.varianceCents));
    return {
      ...match,
      status: "matched" as const,
      recoveredCents: recovered,
      recoveryEvidence: "payout" as const,
      varianceCents: 0,
      receivedCents: match.expectedCents,
      summary: `Confirmed on a later payout file. Recovered ${formatCents(recovered)}.`,
    };
  });

  const now = new Date().toISOString();
  const disputes = workspace.disputes.map((dispute) => {
    const match = matches.find((item) => item.id === dispute.matchId);
    if (!match || match.recoveryEvidence !== "payout") {
      return dispute;
    }
    return { ...dispute, status: "approved" as const, updatedAt: now };
  });

  return { ...workspace, matches, disputes };
}

export function recoveryTotals(matches: MatchRecord[]) {
  const claimed = matches
    .filter((match) => match.recoveredCents > 0 && match.recoveryEvidence === "merchant")
    .reduce((sum, match) => sum + match.recoveredCents, 0);
  const confirmed = matches.filter(isBillableRecovery).reduce((sum, match) => sum + match.recoveredCents, 0);
  return { claimed, confirmed, billable: confirmed };
}
