// Runs in the page's MAIN world on Zoom Web. Tests whether Translator works in the
// page context itself (subject to Zoom's CSP / Permissions Policy). Triggered by
// a postMessage from probe-isolated.js so the click's user activation is still live.
(() => {
  if (window.__zjvMainProbe) return;
  window.__zjvMainProbe = true;

  async function runTranslatorProbe(log) {
    const SAMPLE = "来週の会議は何時からですか？";
    const report = {
      world: "MAIN",
      context: location.href,
      isSecureContext: window.isSecureContext,
      hasTranslator: typeof Translator !== "undefined",
      availability: null,
      translation: null,
      errors: [],
    };
    if (!report.hasTranslator) {
      report.errors.push("`Translator` is not defined in MAIN world");
      return report;
    }
    try {
      report.availability = await Translator.availability({ sourceLanguage: "ja", targetLanguage: "vi" });
      if (report.availability === "unavailable") return report;
      const t0 = performance.now();
      const tr = await Translator.create({
        sourceLanguage: "ja",
        targetLanguage: "vi",
        monitor(m) {
          m.addEventListener("downloadprogress", (e) => log(`download ${Math.round(e.loaded * 100)}%`));
        },
      });
      const t1 = performance.now();
      report.translation = {
        output: await tr.translate(SAMPLE),
        createMs: Math.round(t1 - t0),
        translateMs: Math.round(performance.now() - t1),
      };
    } catch (e) {
      report.errors.push(`${e && e.name}: ${e && e.message}`);
    }
    return report;
  }

  window.addEventListener("message", async (ev) => {
    if (ev.source !== window || !ev.data || ev.data.type !== "ZJV_RUN_MAIN_PROBE") return;
    const report = await runTranslatorProbe((m) =>
      window.postMessage({ type: "ZJV_MAIN_PROBE_LOG", message: m }, "*")
    );
    window.postMessage({ type: "ZJV_MAIN_PROBE_RESULT", report }, "*");
  });
})();
