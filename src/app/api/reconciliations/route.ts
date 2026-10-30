import { NextResponse } from "next/server";
import { SECURITY_HEADERS } from "@/lib/security";
import { getWorkspace, latestRunMatches } from "@/lib/workspace";

export async function GET() {
  const workspace = await getWorkspace();
  const matches = latestRunMatches(workspace);

  return NextResponse.json(
    {
      matches,
      meta: { count: matches.length },
    },
    { headers: SECURITY_HEADERS },
  );
}
