import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Free Website Audit for Chicago Businesses | chiwebdev.com",
  description:
    "Fast website audits for Chicago businesses. Check tracking, SEO basics, and get a plain-English action plan emailed to you.",
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
