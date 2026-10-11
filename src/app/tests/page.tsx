import type { Metadata } from "next";
import { chapterCounts, levelCounts } from "@/server/bank";
import { TestsView } from "./TestsView";

export const metadata: Metadata = {
  title: "ISTQB CTFL practice tests & 40-question mock exams",
  description: "Free ISTQB Foundation Level practice: chapter tests, short and medium sets, and full 40-question, 60-minute mock exams with explanations.",
  alternates: { canonical: "/tests" },
};

export default function TestsPage() {
  return <TestsView counts={chapterCounts()} levels={levelCounts()} />;
}
