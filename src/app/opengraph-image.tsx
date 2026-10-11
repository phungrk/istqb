import { ImageResponse } from "next/og";

export const alt = "Testpassed: learn the ISTQB CTFL v4.0.1 syllabus as a mindmap, then pass the mock exams";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Shared preview image for links to the site (pages without their own image inherit it). */
export default function Image() {
  const step = (n: number, label: string, bg: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 14, background: "#ebddc5", borderRadius: 24, padding: "14px 22px" }}>
      <div style={{ width: 44, height: 44, borderRadius: 22, background: bg, color: "#f5ead8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700 }}>{n}</div>
      <div style={{ fontSize: 30, fontWeight: 700 }}>{label}</div>
    </div>
  );
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#f5ead8", color: "#201e1d" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: "#c67139", color: "#f5ead8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, fontWeight: 700 }}>T</div>
          <div style={{ fontSize: 40, fontWeight: 700 }}>Testpassed</div>
          <div style={{ marginLeft: "auto", background: "#e1eecc", borderRadius: 999, padding: "8px 20px", fontSize: 24 }}>ISTQB® CTFL · v4.0.1</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1 }}>Learn. Test. Fix the gaps.</div>
          <div style={{ fontSize: 34, color: "#4a4440" }}>Syllabus mindmap, glossary and 40-question mock exams. Free.</div>
        </div>
        <div style={{ display: "flex", gap: 18 }}>
          {step(1, "Learn", "#c67139")}
          {step(2, "Test", "#c67139")}
          {step(3, "Fix gaps", "#8fa073")}
        </div>
      </div>
    ),
    size,
  );
}
