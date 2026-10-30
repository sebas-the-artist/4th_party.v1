import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  const hasClerk =
    Boolean(process.env.CLERK_SECRET_KEY) &&
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const dashboard = req.nextUrl.pathname.startsWith("/dashboard");

  if (!hasClerk) {
    if (dashboard && process.env.VERCEL && process.env.ALLOW_PUBLIC_DEMO !== "true") {
      const home = req.nextUrl.clone();
      home.pathname = "/";
      return NextResponse.redirect(home);
    }
    return NextResponse.next();
  }

  const { clerkMiddleware, createRouteMatcher } = await import("@clerk/nextjs/server");
  const isProtected = createRouteMatcher(["/dashboard(.*)"]);
  const handler = clerkMiddleware(
    async (auth, request) => {
      if (isProtected(request)) {
        await auth.protect();
      }
    },
    {
      authorizedParties: [
        "http://localhost:3000",
        "https://dishpute.com",
        "https://www.dishpute.com",
        "https://dishpute.vercel.app",
      ],
    },
  );
  return handler(req, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
