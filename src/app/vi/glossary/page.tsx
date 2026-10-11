import { GlossaryIndex, glossaryMetadata } from "@/app/glossary/views";

export const metadata = glossaryMetadata("vi");

export default function GlossaryPage() {
  return <GlossaryIndex lang="vi" />;
}
