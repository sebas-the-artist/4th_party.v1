import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "4th Party",
  description: "Delivery payout reconciliation for restaurants.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
