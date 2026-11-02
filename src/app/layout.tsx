import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { IBM_Plex_Mono, IBM_Plex_Sans, Newsreader } from "next/font/google";
import { ClerkFlagProvider } from "@/components/clerk-flag";
import { clerkKeysReady, readClerkPublishableKey } from "@/lib/clerk-env";
import { themeBootstrapScript } from "@/theme/palettes";
import "./globals.css";

const serif = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dishpute — delivery payout reconciliation",
  description:
    "Match POS tickets to DoorDash, Uber Eats, and bank deposits. Flag unpaid cancellations and write the dispute. You send the letter from your inbox.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const publishableKey = readClerkPublishableKey();
  const enabled = clerkKeysReady();
  const page =
    enabled && publishableKey ? (
      <ClerkProvider
        publishableKey={publishableKey}
        afterSignOutUrl="/"
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
      >
        <ClerkFlagProvider enabled>{children}</ClerkFlagProvider>
      </ClerkProvider>
    ) : (
      <ClerkFlagProvider enabled={false}>{children}</ClerkFlagProvider>
    );

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      data-palette="harbor"
      data-scheme="light"
      suppressHydrationWarning
    >
      <head>
        <script
          id="theme-bootstrap"
          dangerouslySetInnerHTML={{ __html: themeBootstrapScript }}
        />
      </head>
      <body className={`${serif.variable} ${sans.variable} ${mono.variable}`}>{page}</body>
    </html>
  );
}
