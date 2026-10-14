import type { Attempt } from "./stats";

/** LO → [chapter mindmap topic id, short name] for every LO the question bank tags (names from LO_x_Quiz.xlsx). */
export const LO_INFO: Record<string, [string, string]> = {
  "1.1.1": ["efd", "Mục tiêu của test"], "1.1.2": ["efd", "Testing vs debugging"], "1.2.1": ["efd", "Vì sao testing cần thiết"],
  "1.2.2": ["vv", "QA vs testing"], "1.2.3": ["efd", "Error/defect/failure/root cause"], "1.3.1": ["principles", "7 nguyên tắc testing"],
  "1.4.1": ["activities", "Hoạt động của test process"], "1.4.2": ["activities", "Ngữ cảnh của test process"], "1.4.3": ["testware", "Testware"],
  "1.4.4": ["testware", "Traceability"], "1.4.5": ["activities", "Vai trò test management vs testing"], "1.5.1": ["wholeteam", "Kỹ năng và tâm lý tester"],
  "1.5.2": ["wholeteam", "Whole team approach"], "1.5.3": ["independence", "Mức độc lập"],
  "2.1.1": ["sdlc", "Ảnh hưởng của SDLC lên testing"], "2.1.2": ["sdlc", "Thực hành test tốt theo SDLC"], "2.1.3": ["testfirst", "TDD/ATDD/BDD"],
  "2.1.4": ["sdlc", "DevOps"], "2.1.5": ["shiftleft", "Shift-left"], "2.1.6": ["sdlc", "Retrospective"], "2.2.1": ["levels", "Test level"],
  "2.2.2": ["leveltype", "Test type"], "2.2.3": ["confreg", "Confirmation vs regression"], "2.3.1": ["maint", "Maintenance testing"],
  "3.1.1": ["staticdyn", "Work product cho static testing"], "3.1.2": ["staticdyn", "Lợi ích static testing"], "3.1.3": ["staticdyn", "Static vs dynamic"],
  "3.2.1": ["reviews", "Phản hồi sớm của stakeholder"], "3.2.2": ["reviews", "Hoạt động của review"], "3.2.3": ["reviews", "Vai trò trong review"],
  "3.2.4": ["reviews", "Loại review"], "3.2.5": ["success", "Yếu tố thành công của review"],
  "4.1.1": ["techcat", "Nhóm kỹ thuật test"], "4.2.1": ["ep", "Equivalence partitioning"], "4.2.2": ["bva", "Boundary value analysis"],
  "4.2.3": ["dt", "Decision table"], "4.2.4": ["st", "State transition"], "4.3.1": ["whitebox", "Statement coverage"], "4.3.2": ["whitebox", "Branch coverage"],
  "4.3.3": ["whitebox", "Giá trị của white-box"], "4.4.1": ["experience", "Error guessing"], "4.4.2": ["experience", "Exploratory testing"],
  "4.4.3": ["experience", "Checklist-based"], "4.5.1": ["atdd", "User story"], "4.5.2": ["atdd", "Acceptance criteria"], "4.5.3": ["atdd", "ATDD"],
  "5.1.1": ["plan", "Test plan"], "5.1.2": ["relplan", "Release & iteration planning"], "5.1.3": ["plan", "Entry/exit criteria"], "5.1.4": ["estimate", "Ước lượng test"],
  "5.1.5": ["prio", "Ưu tiên test case"], "5.1.6": ["pyrquad", "Test pyramid"], "5.1.7": ["pyrquad", "Testing quadrants"], "5.2.1": ["risk", "Định nghĩa risk"],
  "5.2.2": ["risk", "Project vs product risk"], "5.2.3": ["risk", "Phân tích risk"], "5.2.4": ["risk", "Phản ứng với risk"], "5.3.1": ["reports", "Metric và monitoring"],
  "5.3.2": ["reports", "Test report"], "5.3.3": ["reports", "Truyền đạt trạng thái test"], "5.4.1": ["config", "Configuration management"],
  "5.5.1": ["defect", "Defect report"], "6.1.1": ["tooltypes", "Loại tool"], "6.2.1": ["automation", "Lợi ích/rủi ro automation"],
};

export type LoLevel = "weak" | "watch" | "low";
export type LoRow = { lo: string; ch: number; topic: string; topicId: string | null; misses: boolean[]; n: number; pct: number; level: LoLevel };
export type LoQuiz = { label: string; title: string; date: string };

/** Only well-formed syllabus LOs ("4.2.4"); a few bank tags are partial and are left out. */
const isLo = (lo: string) => /^[1-6]\.\d+\.\d$/.test(lo);

/**
 * Pure: LO × quiz matrix from the user's own attempts. Only attempts that recorded missedLos count
 * (older ones did not), oldest first as Quiz 1…N; rows are the LOs missed at least once, most missed first.
 * Weak: missed in 2+ quizzes and at least a third of them; watch: 2+ quizzes otherwise; low: a single miss.
 */
export function loMatrix(attempts: Attempt[], chapter?: number): { quizzes: LoQuiz[]; rows: LoRow[] } {
  const at = attempts.filter((a) => Array.isArray(a.missedLos)).sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  const quizzes = at.map((a, i) => ({ label: `Quiz ${i + 1}`, title: a.title, date: a.createdAt.slice(0, 10) }));
  const N = at.length;
  const los = [...new Set(at.flatMap((a) => a.missedLos!))].filter(isLo);
  const rows = los
    .map((lo): LoRow => {
      const misses = at.map((a) => a.missedLos!.includes(lo));
      const n = misses.filter(Boolean).length;
      const pct = n / N;
      const [topicId, topic] = LO_INFO[lo] ?? [null, `LO ${lo}`];
      return { lo, ch: Number(lo[0]), topic, topicId, misses, n, pct, level: n < 2 ? "low" : pct >= 1 / 3 ? "weak" : "watch" };
    })
    .filter((r) => !chapter || r.ch === chapter)
    .sort((a, b) => b.n - a.n || a.lo.localeCompare(b.lo, undefined, { numeric: true }));
  return { quizzes, rows };
}
