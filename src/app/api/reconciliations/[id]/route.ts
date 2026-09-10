import { NextResponse } from "next/server";
import {
  getReconciliationById,
  updateReconciliationStatus,
} from "@/lib/reconciliations";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const validStatuses = [
  "Short deposit",
  "Error charge",
  "Unmatched refund",
  "Matched",
] as const;

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const reconciliation = await getReconciliationById(id);

  if (!reconciliation) {
    return NextResponse.json(
      {
        error: "Reconciliation not found",
      },
      {
        status: 404,
      },
    );
  }

  return NextResponse.json({
     reconciliation,
  });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const reconciliation = await getReconciliationById(id);

  if (!reconciliation) {
    return NextResponse.json(
      {
        error: "Reconciliation not found",
      },
      {
        status: 404,
      },
    );
  }

  const body: unknown = await request.json();

  if (
    typeof body !== "object" ||
    body === null ||
    !("status" in body) ||
    typeof body.status !== "string" ||
    !validStatuses.includes(
      body.status as (typeof validStatuses)[number],
    )
  ) {
    return NextResponse.json(
      {
        error: "Provide a valid status.",
      },
      {
        status: 400,
      },
    );
  }

  const updatedReconciliation = await updateReconciliationStatus(
    id,
    body.status as (typeof validStatuses)[number],
  );

  return NextResponse.json({
     updatedReconciliation,
  });
}
