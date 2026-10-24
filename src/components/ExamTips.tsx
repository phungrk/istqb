"use client";

import { useEffect, useRef, useState } from "react";
import { XIcon } from "@/components/icons";
import { flushNow, track } from "@/lib/track";
import { Lightbulb, ThumbsUp } from "lucide-react";

const sub = { margin: "0 0 4px", fontSize: "var(--fs-14)", fontWeight: 700, color: "var(--color-accent-2-800)" } as const;
const p = { margin: 0 } as const;

/** One of the three question types: its name, what it is, and how to answer it. */
function Kind({ n, name, what, children }: { n: number; name: string; what: string; children: React.ReactNode }) {
  return (
    <section style={{ background: "var(--color-bg)", borderRadius: 24, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 6 }}>
      <h3 style={{ margin: 0, fontSize: "var(--fs-18)" }}>
        {n}. Loại “{name}”
      </h3>
      <span style={{ fontSize: "var(--fs-14)", fontWeight: 600, color: "var(--color-neutral-700)" }}>{what}</span>
      <span style={sub}>Cách làm</span>
      {children}
    </section>
  );
}

/**
 * "Bí kíp phòng thi": a link under the Practice tests heading that opens a modal with Capu's exam tips.
 * Each open is sent as a `tips_open` usage event; /admin → Insights lists who opened it.
 */
export function ExamTips() {
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  // Likes: every click is one like, guest or member. Clicks show at once and go to the server in small batches.
  const [likes, setLikes] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [pop, setPop] = useState(0);
  const pending = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sendLikes = (keepalive = false) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const count = Math.min(pending.current, 50);
    if (!count) return;
    pending.current -= count;
    fetch("/api/tips/like", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ count }), keepalive })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { likes: number }) => setLikes(d.likes + pending.current))
      .catch(() => setLikes((l) => (l === null ? l : Math.max(0, l - count))));
    if (pending.current) sendLikes(keepalive);
  };
  const like = () => {
    pending.current++;
    setLikes((l) => (l ?? 0) + 1);
    setLiked(true);
    setPop((n) => n + 1);
    track("tips_like");
    timer.current ??= setTimeout(() => sendLikes(), 400);
  };

  const show = () => {
    track("tips_open");
    flushNow();
    setOpen(true);
    fetch("/api/tips/like", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { likes: number } | null) => d && setLikes(d.likes + pending.current))
      .catch(() => {});
  };
  const hide = () => {
    sendLikes(true);
    flushNow();
    setOpen(false);
    opener.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && hide();
    const onLeave = () => sendLikes(true);
    addEventListener("keydown", onKey);
    addEventListener("pagehide", onLeave);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      removeEventListener("keydown", onKey);
      removeEventListener("pagehide", onLeave);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        ref={opener}
        type="button"
        onClick={show}
        lang="vi"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: 0, margin: "0 0 10px", border: 0, background: "none", font: "inherit", fontSize: "var(--fs-15)", fontWeight: 700, color: "var(--color-accent-700)", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}
      >
        <Lightbulb size={16} strokeWidth={2.5} aria-hidden /> Bí kíp phòng thi
      </button>

      {open && (
        <div className="dialog-backdrop" onClick={hide} style={{ zIndex: 50 }}>
          <div
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tips-title"
            lang="vi"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "min(640px, 100%)", maxHeight: "calc(100dvh - 32px)", overflowY: "auto", background: "var(--color-neutral-100)", gap: 14 }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <h2 id="tips-title" className="dialog-title" style={{ flex: 1, margin: 0, fontSize: "var(--fs-24)" }}>
                Bí kíp phòng thi
              </h2>
              <button ref={closeBtn} type="button" className="btn btn-ghost" onClick={hide} aria-label="Đóng" style={{ flex: "none", padding: 8 }}>
                <XIcon size={18} />
              </button>
            </div>

            <p style={{ ...p, fontSize: "var(--fs-15)" }}>
              Làm bài test bằng tiếng Anh, bạn sẽ gặp khá nhiều câu hỏi mang tính gài bẫy. Theo kinh nghiệm của Capu, có thể chia các câu hỏi thành 3 loại, và mỗi loại có một cách làm riêng.
            </p>

            <Kind n={1} name="Nhận ra" what="Chọn đúng một phát biểu, định nghĩa hoặc thuật ngữ.">
              <p style={p}>
                Ghi keyword của câu hỏi ra giấy, rồi chia ngay bên dưới keyword đó thành 2 cột: <strong>ĐÚNG | SAI</strong>. Sau đó phân loại từng lựa chọn vào một trong hai cột.
              </p>
              <p style={p}>
                Thông thường, trong 4 lựa chọn sẽ có 2 lựa chọn bạn nhìn là biết ngay thuộc cột nào. Với 2 lựa chọn còn lại, hãy cố tìm điểm khác biệt giữa chúng. Loại suy được một lựa chọn thì xác suất lựa chọn còn lại đúng sẽ cao hơn.
              </p>
            </Kind>

            <Kind n={2} name="Gán nhãn" what="Ghép hoặc phân loại nhiều mục cùng lúc.">
              <p style={p}>
                Ghi ra giấy 2 cột. Ví dụ cột 1 là 1, 2, 3, 4 và cột 2 là i, ii, iii, iv, v… Sau đó dùng bút nối các mục của hai cột với nhau.
              </p>
            </Kind>

            <Kind n={3} name="Tính / áp dụng" what="Chạy một kỹ thuật trên dữ liệu cụ thể.">
              <p style={p}>Học thuộc công thức là bạn lấy được điểm ngay.</p>
            </Kind>

            <p style={{ ...p, background: "var(--color-accent-100)", borderRadius: 20, padding: "12px 16px", fontSize: "var(--fs-15)" }}>
              <strong>Ngoài ra:</strong> khi làm bài, nhớ ghi lại những câu mình không thấy tự tin. Nếu làm xong mà còn dư thời gian, hãy chỉ quay lại kiểm tra các câu này thôi.
            </p>

            <p style={{ ...p, fontWeight: 700, fontSize: "var(--fs-16)" }}>Good luck!!</p>

            <div className="dialog-actions" style={{ marginTop: 0, alignItems: "center", justifyContent: "space-between" }}>
              <button
                type="button"
                className="btn btn-secondary tips-like"
                onClick={like}
                aria-label={`Like${likes !== null ? `, ${likes} lượt` : ""}`}
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <span key={pop} className={pop ? "tips-like-pop" : undefined} style={{ display: "inline-flex" }}>
                  <ThumbsUp size={17} strokeWidth={2.5} fill={liked ? "currentColor" : "none"} aria-hidden />
                </span>
                Like
                <span aria-live="polite" style={{ fontVariantNumeric: "tabular-nums", minWidth: "1ch" }}>{likes ?? "·"}</span>
              </button>
              <button type="button" className="btn btn-primary" onClick={hide}>
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
