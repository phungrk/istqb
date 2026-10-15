// Shared probe logic. Loaded as a classic script in spike.html (extension page)
// and inlined-by-copy in probe-main.js / probe-isolated.js (content scripts cannot
// import from extension files without web_accessible_resources, so the same
// function body is duplicated there on purpose).
//
// Returns a plain JSON-serializable report. Never throws.
async function runTranslatorProbe(log) {
  const SAMPLE = "来週の会議は何時からですか？";
  const report = {
    context: location.href,
    userAgent: navigator.userAgent,
    isSecureContext: window.isSecureContext,
    hasTranslator: typeof Translator !== "undefined",
    pairs: {},
    translations: {},
    errors: [],
  };
  const emit = (m) => log && log(m);

  if (!report.hasTranslator) {
    report.errors.push("`Translator` is not defined in this context");
    return report;
  }

  const pairs = [
    ["ja", "vi"],
    ["ja", "en"],
    ["en", "vi"],
  ];

  for (const [sourceLanguage, targetLanguage] of pairs) {
    const key = `${sourceLanguage}->${targetLanguage}`;
    try {
      report.pairs[key] = await Translator.availability({ sourceLanguage, targetLanguage });
      emit(`availability ${key}: ${report.pairs[key]}`);
    } catch (e) {
      report.pairs[key] = `error: ${e && e.message}`;
      report.errors.push(`availability ${key}: ${e && e.message}`);
    }
  }

  // Direct ja -> vi
  const direct = report.pairs["ja->vi"];
  if (direct && direct !== "unavailable" && !String(direct).startsWith("error")) {
    try {
      const t0 = performance.now();
      const translator = await Translator.create({
        sourceLanguage: "ja",
        targetLanguage: "vi",
        monitor(m) {
          m.addEventListener("downloadprogress", (e) =>
            emit(`download ja->vi: ${Math.round(e.loaded * 100)}%`)
          );
        },
      });
      const t1 = performance.now();
      const out = await translator.translate(SAMPLE);
      const t2 = performance.now();
      report.translations["ja->vi"] = {
        output: out,
        createMs: Math.round(t1 - t0),
        translateMs: Math.round(t2 - t1),
      };
      emit(`ja->vi OK (${Math.round(t2 - t1)} ms): ${out}`);
      if (translator.destroy) translator.destroy();
    } catch (e) {
      report.errors.push(`ja->vi create/translate: ${e && e.name}: ${e && e.message}`);
      emit(`ja->vi FAILED: ${e && e.name}: ${e && e.message}`);
    }
  } else {
    // Pivot fallback: ja -> en -> vi
    try {
      const mk = (s, t) =>
        Translator.create({
          sourceLanguage: s,
          targetLanguage: t,
          monitor(m) {
            m.addEventListener("downloadprogress", (e) =>
              emit(`download ${s}->${t}: ${Math.round(e.loaded * 100)}%`)
            );
          },
        });
      const t0 = performance.now();
      const [a, b] = [await mk("ja", "en"), await mk("en", "vi")];
      const en = await a.translate(SAMPLE);
      const vi = await b.translate(en);
      report.translations["ja->en->vi"] = {
        pivot: en,
        output: vi,
        totalMs: Math.round(performance.now() - t0),
      };
      emit(`pivot ja->en->vi OK: ${en} => ${vi}`);
    } catch (e) {
      report.errors.push(`pivot: ${e && e.name}: ${e && e.message}`);
      emit(`pivot FAILED: ${e && e.name}: ${e && e.message}`);
    }
  }
  return report;
}
