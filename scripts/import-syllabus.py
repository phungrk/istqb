#!/usr/bin/env python3
"""Builds data/syllabus-lo.json: for each mindmap topic, the ISTQB CTFL v4.0.1 learning
objectives (LOs) it covers, with the syllabus sentences that contain the topic's keywords
(keywords wrapped in <mark>).

Usage: python3 scripts/import-syllabus.py <ISTQB_CTFL_Syllabus_v4.0.1.pdf> [repo-dir]
Needs `pdftotext` (poppler-utils). Run after scripts/import-mindmap.mjs.

A topic's keywords are the syllabus's official chapter keywords that appear anywhere in
the topic, plus English terms from its key-term chips, illustration tags and label that
appear verbatim in the syllabus. Which LOs belong to which topic is set in MAP.
"""
import html, json, os, re, subprocess, sys

# Topic → LOs. An entry may name the syllabus sections to quote (default: the LO's own section).
MAP = {
    "efd": ["1.1.1", "1.1.2", "1.2.2", "1.2.3"], "principles": ["1.3.1"], "vv": [("1.1.1", ["1.1", "1.1.1"])],
    "activities": ["1.4.1", "1.4.2", "1.4.5"], "testware": ["1.4.3", "1.4.4"], "independence": ["1.5.3"], "wholeteam": ["1.5.1", "1.5.2"],
    "sdlc": ["2.1.1", "2.1.2"], "levels": ["2.2.1"], "leveltype": ["2.2.2"], "confreg": ["2.2.3"], "maint": ["2.3.1"],
    "testfirst": ["2.1.3"], "shiftleft": ["2.1.5", "2.1.6"],
    "staticdyn": ["3.1.1", "3.1.3"], "reviews": ["3.2.3", "3.2.4"], "success": ["3.2.5"],
    "techcat": ["4.1.1"], "ep": ["4.2.1"], "bva": ["4.2.2"], "dt": ["4.2.3"], "st": ["4.2.4"],
    "whitebox": ["4.3.1", "4.3.2", "4.3.3"], "experience": ["4.4.1", "4.4.2", "4.4.3"], "atdd": ["4.5.1", "4.5.2", "4.5.3"],
    "plan": ["5.1.1", "5.1.3"], "relplan": ["5.1.2"], "estimate": ["5.1.4"], "prio": ["5.1.5"], "pyrquad": ["5.1.6", "5.1.7"],
    "risk": ["5.2.1", "5.2.2", "5.2.3", "5.2.4"], "config": ["5.4.1", "5.5.1"], "defect": ["5.5.1"], "reports": ["5.3.1", "5.3.2"],
    "tooltypes": ["6.1.1"], "automation": ["6.2.1"],
}

VIET = re.compile(r"[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]", re.I)
GENERIC = set("""about after again against before being below between both could different does doing during every further having
itself might other others should their there these those through under until where which while would within without
example examples possible important typical typically usually always number result results people developer developers
least point given value table necessarily testing tester testers software system quality vs""".split())
SPLIT = r"[=≠→←·,;:()+/|\"“”!?\[\]]|\s[-–—]\s"


def strip(s):
    return html.unescape(re.sub(r"<[^>]+>", " ", s))


# ── Syllabus text ──────────────────────────────────────────────────────────────

def parse_syllabus(raw, layout):
    """LO list (FL-x.y.z, K-level, statement) and the paragraphs of every section x.y / x.y.z."""
    los = {}
    for m in re.finditer(r"^FL-(\d\.\d\.\d+)\s+\((K\d)\)\s+(.+)$", layout, re.M):
        los.setdefault(m.group(1), {"lo": m.group(1), "k": m.group(2), "text": m.group(3).strip()})

    lines = raw.split("\n")
    noise = re.compile(r"^(v4\.0\.1|Page \d+ of 78|© International Software Testing Qualifications Board|2024-09-15|Certified Tester|Foundation Level)$")
    start = next(i for i, l in enumerate(lines) if l.strip() == "1.1. What is Testing?")
    end = next(i for i, l in enumerate(lines) if i > start and l.strip() == "7." and next(x for x in lines[i + 1:] if x.strip()).strip() == "References")
    lines = [l.strip() for l in lines[start:end] if not noise.match(l.strip())]

    sections, blocks, buf, cur, capture, i = {}, [], [], None, True, 0

    def flush():
        if buf and cur:
            blocks.append((cur, " ".join(buf)))
        buf.clear()

    while i < len(lines):
        s = lines[i]
        sub, sec = re.match(r"^(\d\.\d\.\d+)\.$", s), re.match(r"^(\d\.\d)\.\s+(.+)$", s)
        if re.search(r"–\s+\d+\s+minutes$", s):  # chapter heading: skip its keyword/LO lists
            flush(); capture, cur = False, None
        elif sub:
            flush(); j = i + 1
            while not lines[j]: j += 1
            cur = sub.group(1); sections[cur] = {"num": cur, "title": lines[j]}; capture = True; i = j
        elif sec:
            flush(); cur = sec.group(1); sections[cur] = {"num": cur, "title": sec.group(2)}; capture = True
        elif not capture:
            pass
        elif not s:
            flush()
        elif s == "•":
            flush(); buf.append("•")
            while i + 1 < len(lines) and not lines[i + 1]: i += 1
        else:
            if re.match(r"^\d\.\s+[A-Z]", s) and buf: flush()  # numbered items, e.g. the seven principles
            buf.append(s)
        i += 1
    flush()

    for k in sections: sections[k]["paras"] = []
    for sec, text in blocks:
        lst = sections[sec]["paras"]
        is_li = text.startswith("• ")
        text = re.sub(r"(\w)- (\w)", r"\1-\2", text[2:] if is_li else text)
        # Re-join a paragraph split by a page break.
        if lst and not is_li and lst[-1]["t"] != "li" and not re.match(r"^\d\.\s", text) and (text[:1].islower() or not re.search(r"[.:;?)]$", lst[-1]["text"])):
            lst[-1]["text"] += " " + text
        else:
            lst.append({"t": "li" if is_li else "p", "text": text})
    return {"los": los, "sections": sections}


def official_keywords(raw):
    out = set()
    for m in re.finditer(r"\n(?:Keywords|Domain-specific keywords)\n(.*?)\n\s*\n", raw, re.S):
        out |= {k.strip().lower() for k in re.sub(r"\s+", " ", m.group(1)).split(",") if k.strip()}
    return out - {"testing", "none"}


# ── Matching ───────────────────────────────────────────────────────────────────

def pat(k):
    """Word-bounded, plural-tolerant, hyphen/space-tolerant pattern for a keyword."""
    body = re.escape(k).replace(r"\-", r"[- ]").replace(r"\ ", r"[\s-]")
    return r"(?<![\w-])" + body + r"(?:s|es)?(?![\w-])"


def has(text, k):
    return re.search(pat(k), text, re.I) is not None


def mark(text, ks):
    esc = html.escape(text, quote=False)
    return re.sub("|".join(pat(k) for k in ks), lambda m: f"<mark>{m.group(0)}</mark>", esc, flags=re.I) if ks else esc


def sentences(text):
    return [s for s in re.split(r"(?<=[.!?])\s+(?=[A-Z0-9(“\"])", text) if s]


def topic_text(t):
    parts = [t["label"], t["hook"], t["trap"]]

    def walk(x):
        if isinstance(x, str): parts.append(x)
        elif isinstance(x, list): [walk(y) for y in x]
        elif isinstance(x, dict): [walk(v) for k, v in x.items() if k != "k"]
    walk(t["body"])
    return strip(" ".join(parts))


def topic_keywords(t, gloss, alltext):
    tt = topic_text(t)
    chips = [x for b in t["body"] if b["k"] == "kw" for x in b["items"]]
    chips += [x for b in t["body"] if b["k"] == "svg" for x in re.findall(r"<span[^>]*>(.*?)</span>", b["t"])]
    phrases, singles = set(), {w.lower() for w in re.findall(r"[A-Za-z][A-Za-z\-]{4,}", t["label"])}
    for s in chips:
        for frag in re.split(SPLIT, strip(s)):
            f = re.sub(r"\s+", " ", frag).strip(" .'").lower()
            if VIET.search(f) or not re.fullmatch(r"[a-z][a-z0-9 \-']+", f or "-"): continue
            w = f.split()
            if 2 <= len(w) <= 6 and w[0] not in {"and", "or", "the", "a", "not", "no", "which", "what"}: phrases.add(f)
            elif len(w) == 1 and len(f) >= 5: singles.add(f)
    own = {p for p in phrases | singles if has(alltext, p) and p not in GENERIC}
    return {g for g in gloss if has(tt, g)} | own


def excerpt(sec, ks, limit=8):
    """Sentences / bullets of a section that contain a keyword, with the list intro kept for context."""
    out, intro = [], None
    for p in sec["paras"]:
        if p["t"] == "p": intro = p
        units = sentences(p["text"]) if p["t"] == "p" else [p["text"]]
        hits = [s for s in units if any(has(s, k) for k in ks)]
        if not hits: continue
        if p["t"] == "li" and intro and intro["text"].endswith(":") and not any(o["src"] is intro for o in out):
            out.append({"t": "p", "src": intro, "html": mark(intro["text"], ks)})
        txt = " … ".join(hits)
        if p["t"] == "p" and len(hits) < len(units):
            txt = ("… " if units[0] not in hits else "") + txt + (" …" if units[-1] not in hits else "")
        out.append({"t": p["t"], "src": p, "html": mark(txt, ks)})
        if sum(o["src"] is not intro for o in out) >= limit: break
    return [{"t": o["t"], "html": o["html"]} for o in out]


def build(syl, raw, mindmap):
    gloss = official_keywords(raw)
    alltext = " ".join(p["text"] for s in syl["sections"].values() for p in s["paras"])
    result = {}
    for c in mindmap:
        for t in c["topics"]:
            base = topic_keywords(t, gloss, alltext)
            entries = []
            for item in MAP[t["id"]]:
                lo, nums = (item, None) if isinstance(item, str) else item
                secs = [syl["sections"][n] for n in nums] if nums else [syl["sections"].get(lo) or syl["sections"][lo[:3]]]
                text = " ".join(p["text"] for s in secs for p in s["paras"])
                found = sorted({k for k in base if has(text, k)}, key=len, reverse=True)
                # Drop a keyword that only ever appears inside a longer found one ("coverage" in "branch coverage").
                found = [k for k in found if not any(k != o and k in o for o in found)
                         or has(re.sub("|".join(pat(o) for o in found if k in o and o != k), " ", text, flags=re.I), k)]
                if not found: continue
                entries.append({
                    "lo": lo, "k": syl["los"][lo]["k"], "statement": mark(syl["los"][lo]["text"], found),
                    "section": " · ".join(f'{s["num"]} {s["title"]}' for s in secs),
                    "keywords": sorted(found, key=str.lower),
                    "excerpt": [e for s in secs for e in excerpt(s, found)],
                })
            result[t["id"]] = entries
    return result


if __name__ == "__main__":
    pdf, repo = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else ".")
    run = lambda *a: subprocess.run(["pdftotext", *a, pdf, "-"], check=True, capture_output=True, text=True).stdout
    raw, layout = run(), run("-layout")
    syl = parse_syllabus(raw, layout)
    mindmap = json.load(open(os.path.join(repo, "data", "mindmap.json")))
    result = build(syl, raw, mindmap)
    json.dump(result, open(os.path.join(repo, "data", "syllabus-lo.json"), "w"), ensure_ascii=False, indent=1)
    print(len(syl["los"]), "LOs,", len(syl["sections"]), "sections;", sum(len(v) for v in result.values()), "LO excerpts for", len(result), "topics")
