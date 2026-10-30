import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { IBM_Plex_Mono, IBM_Plex_Sans, Newsreader } from "next/font/google";
import { clerkEnabled, clerkPublishableKey } from "@/lib/config";
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

export const metadata = {
  title: "4th Party — delivery payout reconciliation",
  description:
    "Match POS tickets to DoorDash, Uber Eats, and bank deposits. Flag unpaid cancellations and write the dispute.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const page = clerkEnabled ? (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      afterSignOutUrl="/"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      {children}
    </ClerkProvider>
  ) : (
    children
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
