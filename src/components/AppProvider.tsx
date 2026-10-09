"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signIn as googleSignIn, signOut as googleSignOut } from "next-auth/react";
import { NODE, chapterTitle } from "@/lib/syllabus";
import { htmlToText, score, type Answers, type Mode, type Question, type SetSpec } from "@/lib/questions";
import { weakest, type Attempt } from "@/lib/stats";

export type Tier = "guest" | "member" | "pro";
/** pro = pricing + AI coach (hidden unless ENABLE_PRO=1); devTools = local "Preview as" bar. */
export type Flags = { google: boolean; devTools: boolean; pro: boolean; payments: "stripe" | "demo"; passMark: number };
/** handle = email for Google users, username for generated accounts. */
export type Me = { handle: string; name: string };
export type Initial = { user: Me | null; tier: Tier; attempts: Attempt[]; learned: string[]; flags: Flags };

/** A drawn set of questions. `spec` lets "Try again" draw a fresh set of the same kind. */
export type ExamSet = { key: string; title: string; questions: Question[]; minutes: number; spec?: SetSpec };
export type ExamState = { set: ExamSet; mode: Mode; idx: number; answers: Answers; started: number };
export type ResultState = {
  set: ExamSet;
  mode: Mode;
  answers: Answers;
  correct: number;
  total: number;
  durationSec: number;
  perChapter: Record<string, [number, number]>;
  saved: boolean;
  saveFailed?: boolean;
};
export type ChatMsg = { role: "user" | "ai"; text: string };
type Dialog = "login" | "checkout" | "upgrade" | null;
export type CoachTab = "chat" | "plan" | "quiz";

const SS = { exam: "tp_exam", result: "tp_result", signingIn: "tp_signing_in" };
const ssGet = <T,>(k: string): T | null => {
  try {
    const v = sessionStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
};
const ssSet = (k: string, v: unknown) => {
  try {
    if (v === null) sessionStorage.removeItem(k);
    else sessionStorage.setItem(k, JSON.stringify(v));
  } catch {}
};

async function postJson<T>(url: string, body?: unknown): Promise<{ ok: boolean; data: T }> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body ?? {}) });
  return { ok: res.ok, data: (await res.json().catch(() => ({}))) as T };
}

function useAppState(initial: Initial) {
  const router = useRouter();
  const pathname = usePathname();
  const { flags } = initial;

  const [user, setUser] = useState(initial.user);
  const [tier, setTier] = useState<Tier>(initial.tier);
  const [attempts, setAttempts] = useState(initial.attempts);
  const [learned, setLearned] = useState<Record<string, boolean>>(() => Object.fromEntries(initial.learned.map((id) => [id, true])));
  useEffect(() => {
    // Server props change after router.refresh() (sign-in, sign-out, upgrade).
    setUser(initial.user);
    setTier(initial.tier);
    setAttempts(initial.attempts);
    setLearned(Object.fromEntries(initial.learned.map((id) => [id, true])));
  }, [initial]);

  const [hydrated, setHydrated] = useState(false);
  const [mode, setMode] = useState<Mode>("practice");
  const [exam, setExamState] = useState<ExamState | null>(null);
  const [result, setResultState] = useState<ResultState | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [pending, setPending] = useState<"checkout" | null>(null);
  const [toastText, setToastText] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ root: true, c1: true, c4: true });
  const [selected, setSelected] = useState("root");
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState("");
  const [coachTab, setCoachTab] = useState<CoachTab>("chat");
  const [quizCh, setQuizCh] = useState<number | null>(null);

  const setExam = useCallback((e: ExamState | null) => {
    setExamState(e);
    ssSet(SS.exam, e);
  }, []);
  const setResult = useCallback((r: ResultState | null) => {
    setResultState(r);
    ssSet(SS.result, r);
  }, []);

  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const toast = useCallback((t: string) => {
    setToastText(t);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastText(""), 2600);
  }, []);

  // Restore exam/result after reloads and the Google sign-in redirect.
  useEffect(() => {
    setExamState(ssGet<ExamState>(SS.exam));
    setResultState(ssGet<ResultState>(SS.result));
    setHydrated(true);
    if (initial.user && ssGet(SS.signingIn)) toast("Signed in as " + initial.user.handle);
    ssSet(SS.signingIn, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Signed in with an unsaved result on screen: save it (also covers "Save my result").
  const saving = useRef(false);
  useEffect(() => {
    if (tier === "guest" || !result || result.saved || result.saveFailed || saving.current) return;
    saving.current = true;
    postJson<{ attempt?: Attempt }>("/api/attempts", {
      title: result.set.title,
      setKey: result.set.key,
      mode: result.mode,
      durationSec: result.durationSec,
      questions: result.set.questions.map((q) => ({ id: q.id, chapter: q.chapter, answers: q.answers, source: q.source })),
      answers: result.answers,
    })
      .then(({ ok, data }) => {
        if (ok && data.attempt) {
          setAttempts((a) => [...a, data.attempt as Attempt]);
          setResult({ ...result, saved: true });
        } else {
          setResult({ ...result, saveFailed: true });
          toast("Could not save this result");
        }
      })
      .finally(() => (saving.current = false));
  }, [tier, result, setResult, toast]);

  const refresh = useCallback(() => router.refresh(), [router]);

  // ── auth ──
  const openLogin = useCallback(() => setDialog("login"), []);
  const closeDialog = useCallback(() => {
    setDialog(null);
    setPending(null);
  }, []);

  const loginPassword = useCallback(
    async (username: string, password: string) => {
      const { ok, data } = await postJson<{ error?: string; username?: string }>("/api/account/login", { username, password });
      if (!ok) return toast(data.error || "Could not sign in");
      setDialog(pending === "checkout" ? "checkout" : null);
      setPending(null);
      toast("Signed in as " + data.username);
      refresh();
    },
    [pending, refresh, toast],
  );

  /** Creates userNNN with an 8-digit password and signs it in. The dialog shows the credentials once. */
  const generateAccount = useCallback(async () => {
    const { ok, data } = await postJson<{ error?: string; username?: string; password?: string }>("/api/account/generate");
    if (!ok || !data.username || !data.password) {
      toast(data.error || "Could not create an account");
      return null;
    }
    refresh();
    return { username: data.username, password: data.password };
  }, [refresh, toast]);

  const loginGoogle = useCallback(() => {
    ssSet(SS.signingIn, true);
    const callbackUrl = pending === "checkout" ? "/pricing?checkout=1" : pathname;
    void googleSignIn("google", { callbackUrl });
  }, [pathname, pending]);

  const signOut = useCallback(async () => {
    await postJson("/api/account/logout");
    if (flags.google) await googleSignOut({ redirect: false });
    setChat([]);
    setPlan("");
    router.push("/");
    refresh();
    toast("Signed out");
  }, [flags.google, refresh, router, toast]);

  const setDemoTier = useCallback(
    async (t: Tier) => {
      await postJson("/api/demo/tier", { tier: t });
      refresh();
    },
    [refresh],
  );

  const upgrade = useCallback(
    async (billing: "monthly" | "yearly") => {
      const { ok, data } = await postJson<{ url?: string; error?: string }>("/api/checkout", { billing });
      if (!ok) return toast(data.error || "Checkout failed");
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setDialog(null);
      router.push("/coach");
      refresh();
      toast("Welcome to Pro. Your AI coach is ready.");
    },
    [refresh, router, toast],
  );

  // ── exams ──
  const startExam = useCallback(
    (set: ExamSet, m: Mode = mode) => {
      setMode(m);
      setExam({ set, mode: m, idx: 0, answers: {}, started: Date.now() });
      router.push("/exam");
    },
    [mode, router, setExam],
  );

  /** Draw a fresh random set from the bank and start it. */
  const startSet = useCallback(
    async (spec: SetSpec, m: Mode = mode) => {
      const params = new URLSearchParams(Object.entries(spec).map(([k, v]) => [k, String(v)]));
      const res = await fetch("/api/sets?" + params, { cache: "no-store" });
      const set = (await res.json().catch(() => null)) as ExamSet | null;
      if (!res.ok || !set?.questions?.length) return toast("Could not load questions");
      startExam(set, m);
    },
    [mode, startExam, toast],
  );

  /** Same kind of set again: a new draw when it came from the bank, otherwise the same questions. */
  const retry = useCallback(
    (set: ExamSet, m: Mode) => (set.spec ? startSet(set.spec, m) : startExam(set, m)),
    [startExam, startSet],
  );

  const submit = useCallback(() => {
    if (!exam) return;
    const s = score(exam.set.questions, exam.answers);
    setResult({
      set: exam.set,
      mode: exam.mode,
      answers: exam.answers,
      ...s,
      durationSec: Math.round((Date.now() - exam.started) / 1000),
      saved: false,
    });
    setExam(null);
    router.push("/result");
  }, [exam, router, setExam, setResult]);

  // ── mindmap ──
  const openNode = useCallback(
    (id: string) => {
      setExpanded((ex) => {
        const next: Record<string, boolean> = { ...ex, root: true };
        for (let n = NODE[id]; n; n = NODE[n.parent ?? ""]) next[n.id] = true;
        return next;
      });
      setSelected(id);
      if (pathname !== "/mindmap") router.push("/mindmap");
    },
    [pathname, router],
  );

  const toggleLearned = useCallback(
    (id: string) => {
      const next = !learned[id];
      setLearned((l) => ({ ...l, [id]: next }));
      void postJson("/api/learned", { nodeId: id, learned: next }).then(({ ok }) => {
        if (!ok) {
          setLearned((l) => ({ ...l, [id]: !next }));
          toast("Could not update your progress");
        }
      });
    },
    [learned, toast],
  );

  // ── coach ──
  const weak = useMemo(() => weakest(attempts), [attempts]);

  const sendChat = useCallback(
    async (text: string) => {
      text = text.trim();
      if (!text || busy) return;
      const next = [...chat, { role: "user" as const, text }];
      setChat(next);
      setBusy(true);
      const { data } = await postJson<{ text?: string }>("/api/coach/chat", { messages: next });
      setBusy(false);
      setChat((c) => [...c, { role: "ai", text: data.text || "I could not reach the AI service just now. Try again in a moment." }]);
    },
    [busy, chat],
  );

  const askAI = useCallback(
    (q: Question, chosen: number[] | undefined) => {
      if (tier !== "pro") return setDialog("upgrade");
      const opts = (idx: number[] | undefined) => (idx?.length ? idx.map((i) => `"${htmlToText(q.options[i])}"`).join(" and ") : "nothing");
      const msg = `Explain this question. I answered ${opts(chosen)} but the correct answer is ${opts(q.answers)}.\n\n${htmlToText(q.stem)}`;
      setCoachTab("chat");
      router.push("/coach");
      void sendChat(msg);
    },
    [router, sendChat, tier],
  );

  const makePlan = useCallback(async () => {
    setBusy(true);
    const { data } = await postJson<{ plan?: string }>("/api/coach/plan");
    setBusy(false);
    if (data.plan) setPlan(data.plan);
    else toast("Could not build a plan just now");
  }, [toast]);

  const makeQuiz = useCallback(async () => {
    const ch = quizCh ?? weak[0].id;
    setBusy(true);
    const { data } = await postJson<{ questions?: Question[] }>("/api/coach/quiz", { chapter: ch });
    setBusy(false);
    if (!data.questions?.length) return toast("Could not write questions just now");
    startExam({ key: "ai" + ch, title: `AI set · Chapter ${ch}`, questions: data.questions, minutes: data.questions.length * 2 }, "practice");
  }, [quizCh, startExam, toast, weak]);

  return {
    flags, user, tier, attempts, learned, hydrated,
    mode, setMode, exam, setExam, result, startExam, startSet, retry, submit,
    dialog, setDialog, pending, setPending, openLogin, closeDialog, loginPassword, generateAccount, loginGoogle, signOut, setDemoTier, upgrade,
    toastText, toast,
    expanded, setExpanded, selected, setSelected, openNode, toggleLearned,
    weak, chat, busy, plan, coachTab, setCoachTab, quizCh, setQuizCh, sendChat, askAI, makePlan, makeQuiz,
    chapterTitle,
  };
}

export type AppState = ReturnType<typeof useAppState>;
const Ctx = createContext<AppState | null>(null);

export function AppProvider({ initial, children }: { initial: Initial; children: React.ReactNode }) {
  const value = useAppState(initial);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used inside AppProvider");
  return v;
}
