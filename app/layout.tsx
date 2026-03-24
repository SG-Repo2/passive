import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Free Website Audit for Chicago Small Businesses | chiwebdev.com",
  description:
    "Submit your homepage for a quick review of tracking and SEO basics. We review the findings and follow up by email.",
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
