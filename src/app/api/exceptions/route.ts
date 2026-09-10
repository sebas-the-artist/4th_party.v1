import { NextResponse } from "next/server";
import { getExceptions } from "@/lib/reconciliations";

export async function GET() {
  const exceptions = await getExceptions();

  return NextResponse.json({
     exceptions,
    meta: {
      count: exceptions.length,
    },
  });
}
