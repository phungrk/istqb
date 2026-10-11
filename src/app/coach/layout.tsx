import type { Metadata } from "next";

export const metadata: Metadata = { title: "AI Coach", robots: { index: false, follow: true } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
