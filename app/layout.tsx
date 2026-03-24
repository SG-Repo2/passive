import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Free Website Audit for Chicago Small Businesses | chiwebdev.com",
  description:
    "Check tracking, title tags, and meta descriptions, then get a plain-English website audit emailed to you.",
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
