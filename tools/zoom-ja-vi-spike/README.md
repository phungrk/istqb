# Zoom JA→VI translator — technical spike (Phase 1)

Throwaway probe, not the MVP. It answers the two blocking questions from the spec:

1. Does Chrome's `Translator` API work for `ja → vi` — and in which context
   (extension page, content script isolated world, page MAIN world)?
2. Where does Zoom Web render Japanese captions in the DOM, and do they update in place?

## Install

1. `chrome://extensions` → enable **Developer mode** → **Load unpacked** → select this folder.
2. Chrome desktop 138+ is required for `Translator`.

## Spike 1 — extension page

Click the extension icon → **Run probe**. The click is the user activation needed to
download the model. Expect `availability` for `ja->vi`, `ja->en`, `en->vi`, then a
translation of `来週の会議は何時からですか？` with timings. If `ja->vi` is `unavailable`
the probe falls back to the `ja → en → vi` pivot and reports both hops.

## Spike 2 — Zoom Web

1. Join a meeting at `https://*.zoom.us/wc/...` in Chrome, turn on captions, speaker language Japanese.
2. A green panel appears bottom-right (in every frame matching the pattern).
3. **Run API probe** — prints results for the ISOLATED world and the MAIN world.
4. Let someone speak Japanese, then **Dump caption candidates**. Each line is
   `DOM path | nodes seen | text changes`. The path with many text changes and
   Japanese text is the caption element; a high "text changes" count means Zoom
   edits the same line while recognizing (so the MVP needs debounce / completion detection).

## What to send back

- Chrome version; output of **Run probe** (Copy JSON button).
- Panel output from Zoom: the API probe lines and the caption-candidate dump
  (redact any real meeting content).
- Which frame URL the captions appeared in (decides whether `all_frames` is needed).

## Decision table

| Result | Next step |
| --- | --- |
| Works in ISOLATED | Translate in the content script (simplest). |
| Only MAIN | Inject translator in MAIN world, bridge via `postMessage`. |
| Only extension page | Needs an offscreen document or side panel as translator host. |
| Nowhere | Local mode unavailable — do not silently fall back to cloud. |
| `ja->vi` unavailable, pivot works | Ship pivot, measure latency vs. the 2 s p95 target. |
