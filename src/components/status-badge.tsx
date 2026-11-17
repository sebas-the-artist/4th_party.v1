import { matchStatusLabel, type MatchRecord, type MatchStatus } from "@/domain/types";

export function StatusBadge({
  status,
  recoveredCents = 0,
  recoveryEvidence = "none",
}: {
  status: MatchStatus;
  recoveredCents?: number;
  recoveryEvidence?: MatchRecord["recoveryEvidence"];
}) {
  const confirmed = recoveredCents > 0 && (recoveryEvidence === "payout" || recoveryEvidence === "bank");
  const claimed = recoveredCents > 0 && recoveryEvidence === "merchant";
  const tone = confirmed ? "recovered" : claimed ? "short_pay" : status;
  const label = confirmed
    ? "Confirmed on payout"
    : claimed
      ? "Claimed — unbilled"
      : matchStatusLabel(status);
  return <span className={`status-badge status-badge--${tone}`}>{label}</span>;
}
