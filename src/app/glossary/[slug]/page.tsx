import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TERM, TERMS } from "@/lib/glossary";
import { TermView, termMetadata } from "../views";

export const dynamicParams = false;

export function generateStaticParams() {
  return TERMS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const t = TERM[(await params).slug];
  return t ? termMetadata(t, "en") : {};
}

export default async function TermPage({ params }: { params: Promise<{ slug: string }> }) {
  const t = TERM[(await params).slug];
  if (!t) notFound();
  return <TermView term={t} lang="en" />;
}
