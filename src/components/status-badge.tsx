import { matchStatusLabel, type MatchStatus } from "@/domain/types";

export function StatusBadge({
  status,
  recoveredCents = 0,
}: {
  status: MatchStatus;
  recoveredCents?: number;
}) {
  const recovered = status === "matched" && recoveredCents > 0;
  return (
    <span className={`status-badge status-badge--${recovered ? "recovered" : status}`}>
      {recovered ? "Refund received" : matchStatusLabel(status)}
    </span>
  );
}
