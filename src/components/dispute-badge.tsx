import { disputeStatusLabel, type DisputeStatus } from "@/domain/types";

export function DisputeBadge({ status }: { status: DisputeStatus }) {
  return (
    <span className={`status-badge status-badge--dispute-${status}`}>
      {disputeStatusLabel(status)}
    </span>
  );
}
