import { NextResponse } from "next/server";
import { SECURITY_HEADERS } from "@/lib/security";
import { exceptionRows, getWorkspace } from "@/lib/workspace";

export async function GET() {
  const workspace = await getWorkspace();
  const exceptions = exceptionRows(workspace);

  return NextResponse.json(
    {
      exceptions,
      meta: { count: exceptions.length },
    },
    { headers: SECURITY_HEADERS },
  );
}
