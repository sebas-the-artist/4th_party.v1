import { NextResponse } from "next/server";
import { getReconciliations } from "@/lib/reconciliations";

export async function GET() {
  const reconciliations = await getReconciliations();

  return NextResponse.json({
     reconciliations,
    meta: {
      count: reconciliations.length,
    },
  });
}
