import { studyPlan } from "@/server/ai";
import { coachContext } from "@/server/coach-context";
import { requireTier } from "@/server/session";

export async function POST() {
  const gate = await requireTier("pro");
  if ("error" in gate) return gate.error;
  const { weak, masteryTable } = await coachContext(gate.user);
  const fallback = [
    `Day 1 — Chapter ${weak[0].id}: reread the mindmap branch and its key points. Do the chapter practice set.`,
    `Day 2 — Chapter ${weak[0].id}: redo the questions you missed and ask the coach to explain each one.`,
    `Day 3 — Chapter ${weak[1].id}: study the mindmap branch, then the chapter practice set.`,
    "Day 4 — Chapter 4: apply EP, BVA, decision tables and state transitions on paper.",
    "Day 5 — AI custom set on your weakest chapter.",
    "Day 6 — Full mock exam under time.",
    "Day 7 — Review every wrong answer from the week.",
  ].join("\n");
  return Response.json({ plan: (await studyPlan(masteryTable, fallback)).trim() });
}
