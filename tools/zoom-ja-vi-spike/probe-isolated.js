// Isolated-world content script on Zoom Web. Two jobs:
//  1. Spike 2: discover where Zoom renders Japanese captions in the DOM
//     (logs element path, aria attributes and sample text of every added/changed
//     node containing Japanese characters).
//  2. Spike 1b: test Translator in the isolated world, and ask the MAIN-world
//     probe to test it in the page world, from a button click (user activation).
(() => {
  if (window.__zjvIsolatedProbe) return;
  window.__zjvIsolatedProbe = true;

  const JA = /[぀-ヿ㐀-䶿一-鿿]/;
  const PANEL_ID = "zjv-spike-panel";
  const seen = new Map(); // path -> { count, sample }
  const updates = new Map(); // path -> number of text changes (partial-caption signal)

  // ---- panel -------------------------------------------------------------
  const panel = document.createElement("div");
  panel.id = PANEL_ID;
  panel.style.cssText =
    "position:fixed;right:8px;bottom:8px;z-index:2147483647;width:380px;max-height:60vh;" +
    "overflow:auto;background:#111;color:#cfe;font:12px/1.4 monospace;padding:8px;" +
    "border:1px solid #4a4;border-radius:6px;";
  panel.innerHTML =
    '<div style="display:flex;gap:6px;margin-bottom:6px">' +
    '<button data-a="api">Run API probe</button>' +
    '<button data-a="dom">Dump caption candidates</button>' +
    '<button data-a="hide">Hide</button></div><pre style="white-space:pre-wrap;margin:0"></pre>';
  const pre = panel.querySelector("pre");
  const log = (m) => {
    pre.textContent += m + "\n";
    pre.scrollTop = pre.scrollHeight;
    console.log("[zjv-spike]", m);
  };
  document.documentElement.appendChild(panel);

  // ---- DOM caption discovery ----------------------------------------------
  function pathOf(el) {
    const parts = [];
    for (let n = el, i = 0; n && n.nodeType === 1 && i < 6; n = n.parentElement, i++) {
      let s = n.tagName.toLowerCase();
      if (n.id) s += "#" + n.id;
      const cls = (n.getAttribute("class") || "").trim().split(/\s+/).filter(Boolean).slice(0, 2);
      if (cls.length) s += "." + cls.join(".");
      const live = n.getAttribute("aria-live");
      if (live) s += `[aria-live=${live}]`;
      const role = n.getAttribute("role");
      if (role) s += `[role=${role}]`;
      parts.unshift(s);
    }
    return parts.join(" > ");
  }

  function note(node) {
    const el = node.nodeType === 1 ? node : node.parentElement;
    if (!el || panel.contains(el)) return;
    const text = (el.textContent || "").trim();
    if (!text || text.length > 400 || !JA.test(text)) return;
    const p = pathOf(el);
    const prev = seen.get(p);
    if (prev) {
      if (prev.sample !== text) updates.set(p, (updates.get(p) || 0) + 1);
      prev.count++;
      prev.sample = text;
    } else {
      seen.set(p, { count: 1, sample: text });
      log(`NEW JA node @ ${p}\n   "${text.slice(0, 60)}"`);
    }
  }

  new MutationObserver((muts) => {
    for (const m of muts) {
      if (m.type === "characterData") note(m.target);
      else m.addedNodes.forEach(note);
    }
  }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });

  // ---- API probes ----------------------------------------------------------
  const SAMPLE = "来週の会議は何時からですか？";

  async function isolatedProbe() {
    const r = { world: "ISOLATED", hasTranslator: typeof Translator !== "undefined" };
    if (!r.hasTranslator) {
      log("ISOLATED: `Translator` is NOT defined");
      return;
    }
    try {
      r.availability = await Translator.availability({ sourceLanguage: "ja", targetLanguage: "vi" });
      log(`ISOLATED: availability ja->vi = ${r.availability}`);
      if (r.availability === "unavailable") return;
      const tr = await Translator.create({ sourceLanguage: "ja", targetLanguage: "vi" });
      log(`ISOLATED: "${SAMPLE}" => ${await tr.translate(SAMPLE)}`);
    } catch (e) {
      log(`ISOLATED: ${e && e.name}: ${e && e.message}`);
    }
  }

  window.addEventListener("message", (ev) => {
    if (ev.source !== window || !ev.data) return;
    if (ev.data.type === "ZJV_MAIN_PROBE_LOG") log("MAIN: " + ev.data.message);
    if (ev.data.type === "ZJV_MAIN_PROBE_RESULT") log("MAIN result: " + JSON.stringify(ev.data.report));
  });

  panel.addEventListener("click", (ev) => {
    const a = ev.target && ev.target.dataset && ev.target.dataset.a;
    if (a === "api") {
      log("--- API probe ---");
      window.postMessage({ type: "ZJV_RUN_MAIN_PROBE" }, "*");
      isolatedProbe();
    } else if (a === "dom") {
      log("--- caption candidates (path | node-count | text-changes) ---");
      for (const [p, v] of seen) log(`${p} | ${v.count} | ${updates.get(p) || 0}\n   "${v.sample.slice(0, 50)}"`);
      log(`frame: ${location.href}`);
    } else if (a === "hide") {
      panel.remove();
    }
  });

  log(`zjv spike ready in frame ${location.href}`);
  log("Turn on Zoom captions (Japanese) and let someone speak.");
})();
