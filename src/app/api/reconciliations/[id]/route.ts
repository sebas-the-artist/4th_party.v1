import { NextResponse } from "next/server";
import { SECURITY_HEADERS } from "@/lib/security";
import { getMatchDetail, getWorkspace } from "@/lib/workspace";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const workspace = await getWorkspace();
  const detail = getMatchDetail(workspace, id);

  if (!detail) {
    return NextResponse.json(
      { error: "Match not found" },
      { status: 404, headers: SECURITY_HEADERS },
    );
  }

  return NextResponse.json(
    {
      match: detail.match,
      pos: detail.pos ?? null,
      delivery: detail.delivery ?? null,
      deposit: detail.deposit
        ? { ...detail.deposit, memo: detail.deposit.memo }
        : null,
    },
    { headers: SECURITY_HEADERS },
  );
}
