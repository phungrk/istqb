import { chapterCounts, levelCounts } from "@/server/bank";
import { TestsView } from "./TestsView";

export default function TestsPage() {
  return <TestsView counts={chapterCounts()} levels={levelCounts()} />;
}
