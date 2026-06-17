import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeonReach — T1 Content Analyzer",
  description: "AI-powered social media content analyzer for T1 audiences",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
