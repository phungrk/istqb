import { GlossaryIndex, glossaryMetadata } from "./views";

export const metadata = glossaryMetadata("en");

export default function GlossaryPage() {
  return <GlossaryIndex lang="en" />;
}
