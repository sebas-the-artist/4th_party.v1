import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  if (!process.env.CLERK_SECRET_KEY || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return NextResponse.next();
  }

  const { clerkMiddleware, createRouteMatcher } = await import("@clerk/nextjs/server");
  const isProtected = createRouteMatcher(["/dashboard(.*)"]);
  const handler = clerkMiddleware(async (auth, request) => {
    if (isProtected(request)) {
      await auth.protect();
    }
  });
  return handler(req, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
