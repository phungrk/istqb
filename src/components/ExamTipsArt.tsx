// Illustrations for the three question types in the "Bí kíp phòng thi" modal. Inline SVG drawn with the
// design tokens (so they follow the theme), text in the page font, one 320×190 frame each.
import type { ReactNode } from "react";

const W = 320;
const H = 190;
const T = { fontFamily: "inherit", fontWeight: 700 } as const;

function Frame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg
      className="tips-art"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={label}
      style={{ display: "block", width: "100%", maxWidth: 360, height: "auto", alignSelf: "center", margin: "4px 0 2px" }}
    >
      <rect x="2" y="2" width={W - 4} height={H - 4} rx="22" fill="var(--color-surface)" stroke="var(--color-divider)" strokeWidth="2" />
      {children}
    </svg>
  );
}

/** A small tick or cross badge. */
function Badge({ x, y, ok }: { x: number; y: number; ok: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="9" fill={ok ? "var(--color-accent-2-600)" : "var(--color-accent-600)"} />
      <path
        d={ok ? "M-4 0.5 L-1 3.5 L4.5 -3" : "M-3.5 -3.5 L3.5 3.5 M3.5 -3.5 L-3.5 3.5"}
        fill="none"
        stroke="var(--color-bg)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

/** 1. Nhận ra: keyword, two columns ĐÚNG | SAI, two options placed at once, two to compare. */
export function RecognizeArt() {
  const chip = (x: number, y: number, label: string, tone: "ok" | "no", unsure = false) => (
    <g key={label}>
      <rect
        x={x}
        y={y}
        width="112"
        height="30"
        rx="15"
        fill="var(--color-bg)"
        stroke={tone === "ok" ? "var(--color-accent-2-600)" : "var(--color-accent-600)"}
        strokeWidth="2.5"
        strokeDasharray={unsure ? "5 5" : undefined}
      />
      <text x={x + 16} y={y + 20} fontSize="15" fill="var(--color-text)" style={T}>
        {label}
      </text>
      {unsure ? (
        <text x={x + 92} y={y + 22} fontSize="18" textAnchor="middle" fill="var(--color-neutral-700)" style={T}>
          ?
        </text>
      ) : (
        <Badge x={x + 92} y={y + 15} ok={tone === "ok"} />
      )}
    </g>
  );
  return (
    <Frame label="Ghi keyword ra giấy, chia hai cột ĐÚNG và SAI. Hai lựa chọn A và D xếp ngay vào cột; B và C còn phân vân nên so sánh điểm khác biệt.">
      {/* keyword written at the top */}
      <rect x="18" y="14" width="124" height="28" rx="14" fill="var(--color-accent-200)" />
      <text x="30" y="33" fontSize="15" fill="var(--color-accent-800)" style={T}>
        keyword
      </text>
      {/* a pencil: "ghi keyword ra giấy" */}
      <g transform="translate(180 29) rotate(160)">
        <rect x="-34" y="-6" width="50" height="12" rx="3" fill="var(--color-accent-600)" />
        <rect x="-34" y="-6" width="10" height="12" rx="3" fill="var(--color-accent-800)" />
        <path d="M16 -6 L32 0 L16 6 Z" fill="var(--color-accent-200)" stroke="var(--color-accent-600)" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M27 -2 L32 0 L27 2 Z" fill="var(--color-text)" />
      </g>

      {/* the two columns */}
      <rect x="18" y="54" width="136" height="122" rx="18" fill="var(--color-accent-2-100)" />
      <rect x="166" y="54" width="136" height="122" rx="18" fill="var(--color-accent-100)" />
      <text x="86" y="76" fontSize="15" textAnchor="middle" fill="var(--color-accent-2-800)" style={T}>
        ĐÚNG
      </text>
      <text x="234" y="76" fontSize="15" textAnchor="middle" fill="var(--color-accent-800)" style={T}>
        SAI
      </text>
      <line x1="160" y1="60" x2="160" y2="170" stroke="var(--color-divider)" strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round" />

      {chip(30, 86, "A", "ok")}
      {chip(178, 86, "D", "no")}
      {chip(30, 132, "B", "ok", true)}
      {chip(178, 132, "C", "no", true)}

      {/* compare the two unsure ones */}
      <path d="M146 147 H174" stroke="var(--color-neutral-700)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 5" />
      <circle cx="160" cy="147" r="11" fill="var(--color-text)" />
      <text x="160" y="153" fontSize="16" textAnchor="middle" fill="var(--color-bg)" style={T}>
        ≠
      </text>
    </Frame>
  );
}

/** 2. Gán nhãn: two columns, pen lines joining the items. */
export function MatchArt() {
  const left = ["1", "2", "3", "4"];
  const right = ["i", "ii", "iii", "iv"];
  // 1→iii, 2→i, 3→iv, 4→ii
  const pairs = [2, 0, 3, 1];
  const y = (i: number) => 58 + i * 38;
  const dot = (cx: number, cy: number, label: string, side: "l" | "r") => (
    <g key={side + label}>
      <circle cx={cx} cy={cy} r="15" fill={side === "l" ? "var(--color-accent-200)" : "var(--color-accent-2-200)"} />
      <text x={cx} y={cy + 5.5} fontSize="16" textAnchor="middle" fill={side === "l" ? "var(--color-accent-800)" : "var(--color-accent-2-800)"} style={T}>
        {label}
      </text>
    </g>
  );
  return (
    <Frame label="Ghi hai cột, ví dụ cột 1 là 1, 2, 3, 4 và cột 2 là i, ii, iii, iv, rồi dùng bút nối từng mục: 1 với iii, 2 với i, 3 với iv, 4 với ii.">
      <text x="70" y="30" fontSize="13" textAnchor="middle" fill="var(--color-neutral-700)" style={T}>
        Cột 1
      </text>
      <text x="250" y="30" fontSize="13" textAnchor="middle" fill="var(--color-neutral-700)" style={T}>
        Cột 2
      </text>
      <line x1="160" y1="40" x2="160" y2="172" stroke="var(--color-divider)" strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round" />
      {pairs.map((r, l) => (
        <path
          key={l}
          d={`M86 ${y(l)} C 150 ${y(l)}, 170 ${y(r)}, 234 ${y(r)}`}
          fill="none"
          stroke="var(--color-accent-700)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      ))}
      {left.map((t, i) => dot(70, y(i), t, "l"))}
      {right.map((t, i) => dot(250, y(i), t, "r"))}
    </Frame>
  );
}

/** 3. Tính / áp dụng: the formula, the numbers in, the answer. */
export function ComputeArt() {
  return (
    <Frame label="Học thuộc công thức rồi thay số: ví dụ ước lượng ba điểm E = (O + 4M + P) / 6, với O = 2, M = 11, P = 14 thì E = 10.">
      <rect x="18" y="14" width="170" height="26" rx="13" fill="var(--color-accent-200)" />
      <text x="30" y="32" fontSize="13" fill="var(--color-accent-800)" style={T}>
        Three-point estimation
      </text>

      {/* E = (O + 4M + P) / 6 */}
      <text x="22" y="86" fontSize="24" fill="var(--color-text)" style={T}>
        E =
      </text>
      <text x="138" y="72" fontSize="20" textAnchor="middle" fill="var(--color-text)" style={T}>
        O + 4M + P
      </text>
      <line x1="72" y1="80" x2="204" y2="80" stroke="var(--color-text)" strokeWidth="2.5" strokeLinecap="round" />
      <text x="138" y="102" fontSize="20" textAnchor="middle" fill="var(--color-text)" style={T}>
        6
      </text>

      {/* the numbers going in */}
      {[
        ["O = 2", 18, "optimistic"],
        ["M = 11", 112, "most likely"],
        ["P = 14", 206, "pessimistic"],
      ].map(([t, x, hint]) => (
        <g key={t as string}>
          <rect x={x as number} y="118" width="92" height="26" rx="13" fill="var(--color-bg)" stroke="var(--color-accent-600)" strokeWidth="2.5" />
          <text x={(x as number) + 46} y="136" fontSize="15" textAnchor="middle" fill="var(--color-text)" style={T}>
            {t}
          </text>
          <text x={(x as number) + 46} y="158" fontSize="11" textAnchor="middle" fill="var(--color-neutral-700)" style={{ fontFamily: "inherit", fontWeight: 600 }}>
            {hint}
          </text>
        </g>
      ))}

      {/* the answer */}
      <circle cx="262" cy="70" r="30" fill="var(--color-accent-2-600)" />
      <text x="262" y="80" fontSize="28" textAnchor="middle" fill="var(--color-bg)" style={T}>
        10
      </text>
      <text x="262" y="30" fontSize="13" textAnchor="middle" fill="var(--color-accent-2-800)" style={T}>
        +1 điểm
      </text>
      <path d="M212 80 H226 M220 73 L227 80 L220 87" fill="none" stroke="var(--color-accent-2-600)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </Frame>
  );
}
