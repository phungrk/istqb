import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ISTQB CTFL v4.0.1 syllabus mindmap: all 6 chapters",
  description: "The whole ISTQB Foundation Level v4.0.1 syllabus as an interactive mindmap: 36 topics with memory hooks, exam traps and the official learning objectives.",
  alternates: { canonical: "/mindmap" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
