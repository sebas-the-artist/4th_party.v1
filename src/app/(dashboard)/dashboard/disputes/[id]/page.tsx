import Link from "next/link";
import { notFound } from "next/navigation";
import { DisputeBadge } from "@/components/dispute-badge";
import { DisputeLetterEditor } from "@/components/dispute-letter-editor";
import { getMatchDetail, getWorkspace } from "@/lib/workspace";

export default async function DisputeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workspace = await getWorkspace();
  const dispute = workspace.disputes.find((item) => item.id === id);
  if (!dispute) {
    notFound();
  }
  const detail = getMatchDetail(workspace, dispute.matchId);
  if (!detail) {
    notFound();
  }

  const denied = dispute.status === "denied";

  return (
    <section>
      <Link className="page-back" href="/dashboard/disputes">
        ← Disputes
      </Link>
      <header className="page-header">
        <div>
          <p className="page-header__kicker">Dispute draft</p>
          <h1 className="page-header__title">{dispute.subject || "Edit letter"}</h1>
          <p className="page-header__text">
            This app does not send mail. You copy the letter or open it in your
            inbox so Uber and DoorDash only see the restaurant.
          </p>
        </div>
        <DisputeBadge status={dispute.status} />
      </header>

      {denied ? (
        <p className="empty-state">
          Refund denied. Next step: add more evidence, change the status to Ready
          to send, and try again — or close the case.
        </p>
      ) : null}

      <DisputeLetterEditor
        key={dispute.updatedAt}
        dispute={dispute}
        contact={workspace.contact}
        businessName={detail.location?.name ?? "Good Burger"}
        canResolve={detail.match.status !== "matched"}
      />
    </section>
  );
}
