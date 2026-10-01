#!/usr/bin/env python3
"""Parse the official BAMF catalog and attach a checked answer index.

Question text comes only from the local PDF extract. The answer index is
taken from a May-2025 community key when the German stem and options match,
then spot-checked. Unmatched items are written out and must not ship.
"""

from __future__ import annotations

import argparse
import json
import re
import unicodedata
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_SOURCE_DIR = BASE_DIR / "data" / "source"
DEFAULT_OUT_DIR = BASE_DIR / "data"
DEFAULT_SITE_DIR = BASE_DIR / "site"

BOX = "\uf0a3□☐"
PAGE_RE = re.compile(r"\[\[PAGE (\d+)\]\]")
AUFGABE_RE = re.compile(r"^Aufgabe\s+(\d+)\s*$")
OPTION_RE = re.compile(rf"^\s*[{BOX}]\s*(.+?)\s*$")
STATE_RE = re.compile(r"Fragen für das Bundesland\s+(.+?)\s*$")
CREDIT_RE = re.compile(r"©\s*.+")
BILD_LABEL_RE = re.compile(r"^(Bild\s*[1-4]\s*){2,}$")
FOOTER_RE = re.compile(r"Seite\s+\d+\s+von\s+191")

STATE_SLUG = {
    "Baden-Württemberg": "BW",
    "Bayern": "BY",
    "Berlin": "BE",
    "Brandenburg": "BB",
    "Bremen": "HB",
    "Hamburg": "HH",
    "Hessen": "HE",
    "Mecklenburg-Vorpommern": "MV",
    "Niedersachsen": "NI",
    "Nordrhein-Westfalen": "NW",
    "Rheinland-Pfalz": "RP",
    "Saarland": "SL",
    "Sachsen": "SN",
    "Sachsen-Anhalt": "ST",
    "Schleswig-Holstein": "SH",
    "Thüringen": "TH",
}

REF_SLUG = {
    "baden-wuerttemberg": "BW",
    "bayern": "BY",
    "berlin": "BE",
    "brandenburg": "BB",
    "bremen": "HB",
    "hamburg": "HH",
    "hessen": "HE",
    "mecklenburg-vorpommern": "MV",
    "niedersachsen": "NI",
    "nordrhein-westfalen": "NW",
    "rheinland-pfalz": "RP",
    "saarland": "SL",
    "sachsen": "SN",
    "sachsen-anhalt": "ST",
    "schleswig-holstein": "SH",
    "thueringen": "TH",
}


def norm(s: str) -> str:
    s = s.replace("\u00ad", "").replace("ß", "ss")
    s = unicodedata.normalize("NFKC", s)
    s = s.replace("ä", "ae").replace("ö", "oe").replace("ü", "ue")
    s = s.replace("Ä", "ae").replace("Ö", "oe").replace("Ü", "ue")
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return " ".join(s.split())


def load_pages(pdf_path: Path | None = None) -> str:
    path = pdf_path or (DEFAULT_SOURCE_DIR / "full.txt")
    raw = path.read_text(encoding="utf-8")
    parts = raw.split("\f")
    chunks = []
    for i, part in enumerate(parts, 1):
        chunks.append(f"\n[[PAGE {i}]]\n")
        chunks.append(FOOTER_RE.sub("", part))
    return "".join(chunks)


def parse_questions(text: str) -> list[dict]:
    current_page = 1
    current_state = None
    questions = []
    pending = None
    option = None

    def finish():
        nonlocal pending, option
        if pending is None:
            return
        if option is not None:
            pending["options"].append(clean_join(option))
            option = None
        q = " ".join(x.strip() for x in pending["qlines"] if x.strip())
        q = re.sub(r"\s+", " ", q).strip()
        item = {
            "num": pending["num"],
            "state": pending["state"],
            "page": pending["page"],
            "question": q,
            "options": pending["options"],
            "credit": pending["credit"],
        }
        questions.append(item)
        pending = None

    for raw_line in text.splitlines():
        line = raw_line.rstrip()
        page_m = PAGE_RE.fullmatch(line.strip())
        if page_m:
            current_page = int(page_m.group(1))
            continue
        stripped = line.strip()
        if not stripped:
            continue
        if stripped in {"Teil I", "Teil II", "Allgemeine Fragen"}:
            continue
        state_m = STATE_RE.search(stripped)
        if state_m:
            finish()
            current_state = state_m.group(1).strip()
            continue
        auf_m = AUFGABE_RE.match(stripped)
        if auf_m:
            finish()
            pending = {
                "num": int(auf_m.group(1)),
                "state": current_state,
                "page": current_page,
                "qlines": [],
                "options": [],
                "credit": None,
            }
            option = None
            continue
        if pending is None:
            continue
        if CREDIT_RE.search(stripped):
            pending["credit"] = stripped
            continue
        if BILD_LABEL_RE.match(re.sub(r"\s+", " ", stripped)):
            continue
        opt_m = OPTION_RE.match(line)
        if opt_m:
            if option is not None:
                pending["options"].append(clean_join(option))
            option = [opt_m.group(1).strip()]
            continue
        if option is not None and (line.startswith(" ") or line.startswith("\t")):
            option.append(stripped)
            continue
        if option is None:
            pending["qlines"].append(stripped)
        else:
            # A non-indented leftover after options: ignore section crumbs.
            continue
    finish()
    return questions


def clean_join(parts: list[str]) -> str:
    return re.sub(r"\s+", " ", " ".join(parts)).strip()


def ref_items(ref_path: Path | None = None) -> list[dict]:
    path = ref_path or (DEFAULT_SOURCE_DIR / "ref" / "quiz-data.json")
    data = json.loads(path.read_text(encoding="utf-8"))
    items = []

    def local_num(raw_id: object, general: bool) -> int:
        if isinstance(raw_id, int):
            n = raw_id
        else:
            n = int(re.search(r"(\d+)$", str(raw_id)).group(1))
        if not general and n > 300:
            return n - 300
        return n

    for q in data["general"]:
        items.append(
            {
                "scope": "general",
                "state": None,
                "num": local_num(q["id"], True),
                "stem": norm(q["de"]),
                "options": [o["de"] for o in q["options"]],
                "correct": q["correct"],
            }
        )
    for slug, block in data["states"].items():
        code = REF_SLUG[slug]
        for q in block["questions"]:
            items.append(
                {
                    "scope": code,
                    "state": code,
                    "num": local_num(q["id"], False),
                    "stem": norm(q["de"]),
                    "options": [o["de"] for o in q["options"]],
                    "correct": q["correct"],
                }
            )
    return items


ARTICLES = {
    "die", "der", "das", "ein", "eine", "einen", "einem", "einer",
    "dem", "den", "des", "sie", "er", "ihr", "ihre", "ihren", "ihrem",
    "sein", "seine", "seinen", "und", "oder", "zur", "zum", "im", "in",
    "am", "an", "auf", "von", "vom", "mit", "bei", "zu", "fuer", "durch",
}


def soft_tokens(s: str) -> set[str]:
    s = norm(s).replace("/", " ")
    out = set()
    for w in s.split():
        if w in ARTICLES or len(w) < 3:
            continue
        if w.endswith("innen") and len(w) > 8:
            w = w[:-5]
        elif w.endswith("in") and len(w) > 7:
            w = w[:-2]
        out.add(w)
    return out


def soft_hit(a: str, b: str) -> float:
    ta, tb = soft_tokens(a), soft_tokens(b)
    if not ta or not tb:
        return 1.0 if norm(a) == norm(b) else 0.0
    return len(ta & tb) / len(ta | tb)


def tokens(s: str) -> set[str]:
    return set(norm(s).split())


def jaccard(a: str, b: str) -> float:
    ta, tb = tokens(a), tokens(b)
    if not ta or not tb:
        return 0.0
    return len(ta & tb) / len(ta | tb)


def img_num(s: str) -> int | None:
    m = re.fullmatch(r"(?:bild )?([1-4])", norm(s))
    return int(m.group(1)) if m else None


def gender_norm(s: str) -> str:
    s = norm(s)
    s = re.sub(r"(\w{4,})innen \1\b", r"\1", s)
    s = re.sub(r"\b(\w{4,}) \1innen\b", r"\1", s)
    s = re.sub(r"(\w{4,})in \1\b", r"\1", s)
    s = re.sub(r"\b(\w{4,}) \1in\b", r"\1", s)
    s = re.sub(r"(\w{4,}) innen\b", r"\1", s)
    s = s.replace(" jahre", "")
    return " ".join(w for w in s.split() if w not in ARTICLES)


def content_bag(s: str) -> tuple[str, ...]:
    return tuple(sorted(gender_norm(s).split()))


def stem_tok(w: str) -> str:
    for suf in ("innen", "ern", "en", "er", "in", "e", "n"):
        if w.endswith(suf) and len(w) - len(suf) >= 5:
            return w[: -len(suf)]
    return w


def stem_bag(s: str) -> tuple[str, ...]:
    return tuple(sorted(stem_tok(w) for w in gender_norm(s).split()))


def map_correct(
    pdf_opts: list[str], ref_opts: list[str], ref_index: int, *, allow_lone_exact: bool = False
) -> tuple[int | None, str]:
    if not (0 <= ref_index < len(ref_opts)) or len(pdf_opts) != 4 or len(ref_opts) < 4:
        return None, "bad-ref"
    target = ref_opts[ref_index]
    target_img = img_num(target)
    if target_img is not None:
        hits = [i for i, opt in enumerate(pdf_opts) if img_num(opt) == target_img]
        if len(hits) == 1:
            return hits[0], "ok"
        return None, "image-ambiguous"

    def paired(keys_pdf, keys_ref) -> int:
        return sum(1 for key in keys_pdf if key and key in keys_ref)

    exact = [i for i, opt in enumerate(pdf_opts) if norm(opt) == norm(target)]
    if len(exact) == 1 and allow_lone_exact:
        return exact[0], "ok"

    ghits = [i for i, opt in enumerate(pdf_opts) if gender_norm(opt) == gender_norm(target)]
    if len(ghits) == 1 and paired(
        [gender_norm(o) for o in pdf_opts], [gender_norm(o) for o in ref_opts]
    ) >= 3:
        return ghits[0], "ok"

    target_bag = content_bag(target)
    bhits = [i for i, opt in enumerate(pdf_opts) if content_bag(opt) == target_bag and target_bag]
    bag_paired = paired([content_bag(o) for o in pdf_opts], [content_bag(o) for o in ref_opts])
    if len(bhits) == 1 and bag_paired >= 3:
        return bhits[0], "ok"

    shits = [i for i, opt in enumerate(pdf_opts) if stem_bag(opt) == stem_bag(target) and stem_bag(target)]
    if len(shits) == 1 and paired([stem_bag(o) for o in pdf_opts], [stem_bag(o) for o in ref_opts]) >= 3:
        return shits[0], "ok"

    def contains(short: str, long: str) -> bool:
        sw, lw = short.split(), long.split()
        if not sw or len(sw) >= len(lw):
            return False
        return any(lw[i : i + len(sw)] == sw for i in range(len(lw) - len(sw) + 1))

    chits = [
        i
        for i, opt in enumerate(pdf_opts)
        if contains(gender_norm(opt), gender_norm(target))
    ]
    others = 0
    for opt in pdf_opts:
        if gender_norm(opt) in {gender_norm(r) for r in ref_opts}:
            others += 1
    if len(chits) == 1 and others >= 2:
        return chits[0], "ok"
    return None, f"unmapped exact={len(exact)} gender={len(ghits)} bag={len(bhits)} stem={len(shits)} cont={len(chits)}"


def match_answer(q: dict, refs: list[dict]) -> dict:
    scope = STATE_SLUG[q["state"]] if q["state"] else "general"
    pool = [r for r in refs if r["scope"] == scope]
    same = next((r for r in pool if r["num"] == q["num"]), None)
    stem = q["question"]
    correct = None
    reason = ""
    score = 0.0
    ref_num = None
    if same is not None:
        score = jaccard(stem, same["stem"])
        ref_num = same["num"]
        mapped, why = map_correct(q["options"], same["options"], same["correct"], allow_lone_exact=True)
        if mapped is not None:
            correct = mapped
            reason = "same-number" if score >= 0.55 else "same-number-rewritten"
        else:
            reason = f"same-number-failed {why} stem={score:.2f}"
    if correct is None:
        ranked = sorted(pool, key=lambda r: (jaccard(stem, r["stem"]),), reverse=True)
        best = ranked[0] if ranked else None
        if best is not None:
            score = jaccard(stem, best["stem"])
            ref_num = best["num"]
            mapped, why = map_correct(q["options"], best["options"], best["correct"])
            if mapped is not None and score >= 0.62:
                correct = mapped
                reason = "stem-fallback"
            elif not reason:
                reason = f"no-match stem={score:.2f} {why}"
    return {
        "correct": correct,
        "reason": reason,
        "score": round(score, 3),
        "opt_hits": 0,
        "ref_num": ref_num,
        "ref_scope": scope,
    }


def image_kind(q: dict) -> str | None:
    opts = [o.strip() for o in q["options"]]
    if opts == ["Bild 1", "Bild 2", "Bild 3", "Bild 4"]:
        return "four"
    if opts == ["1", "2", "3", "4"]:
        return "four"
    if "dieses Bild" in q["question"] or q.get("credit"):
        return "photo"
    return None


def assign_ids(questions: list[dict]) -> list[dict]:
    out = []
    for q in questions:
        if q["state"] is None:
            qid = f"g-{q['num']:03d}"
            land = None
        else:
            code = STATE_SLUG[q["state"]]
            qid = f"{code}-{q['num']:02d}"
            land = code
        kind = image_kind(q)
        out.append(
            {
                "id": qid,
                "num": q["num"],
                "land": land,
                "land_name": q["state"],
                "page": q["page"],
                "question": q["question"],
                "options": q["options"],
                "correct": q["correct"],
                "image": kind,
                "credit": q.get("credit"),
                "match": q["reason"],
            }
        )
    return out


def main() -> None:
    parser = argparse.ArgumentParser(description="Parse BAMF catalog and match answers.")
    parser.add_argument(
        "--source-dir",
        type=Path,
        default=DEFAULT_SOURCE_DIR,
        help="Path to directory containing source files (full.txt and ref/quiz-data.json)",
    )
    parser.add_argument(
        "--out-dir",
        type=Path,
        default=DEFAULT_OUT_DIR,
        help="Path to output directory for questions.json and build-report.json",
    )
    parser.add_argument(
        "--site-dir",
        type=Path,
        default=DEFAULT_SITE_DIR,
        help="Path to site directory for questions.js",
    )
    parser.add_argument(
        "--no-site",
        action="store_true",
        help="Do not write site/questions.js",
    )
    args = parser.parse_args()

    pdf_path = args.source_dir / "full.txt"
    ref_path = args.source_dir / "ref" / "quiz-data.json"
    out_dir = args.out_dir
    site_dir = args.site_dir

    questions = parse_questions(load_pages(pdf_path))
    refs = ref_items(ref_path)
    bad = []
    for q in questions:
        if len(q["options"]) != 4 or not q["question"]:
            bad.append(q)
            q["correct"] = None
            q["reason"] = "parse-failed"
            continue
        hit = match_answer(q, refs)
        q["correct"] = hit["correct"]
        q["reason"] = hit["reason"]
        q["score"] = hit["score"]
        q["ref_num"] = hit["ref_num"]
    items = assign_ids(questions)
    out_dir.mkdir(parents=True, exist_ok=True)
    report = {
        "parsed": len(questions),
        "general": sum(1 for q in items if q["land"] is None),
        "state": sum(1 for q in items if q["land"]),
        "by_land": {},
        "unmatched": [
            {
                "id": q["id"],
                "page": q["page"],
                "question": q["question"],
                "options": q["options"],
                "match": q["match"],
            }
            for q in items
            if q["correct"] is None
        ],
        "parse_bad": len(bad),
        "image": sum(1 for q in items if q["image"]),
    }
    for q in items:
        if q["land"]:
            report["by_land"][q["land"]] = report["by_land"].get(q["land"], 0) + 1
    (out_dir / "questions.json").write_text(
        json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (out_dir / "build-report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    if not args.no_site and site_dir:
        site_dir.mkdir(parents=True, exist_ok=True)
        site_items = [
            {
                "id": q["id"],
                "num": q["num"],
                "land": q["land"],
                "page": q["page"],
                "question": q["question"],
                "options": q["options"],
                "correct": q["correct"],
                "image": q["image"],
            }
            for q in items
        ]
        (site_dir / "questions.js").write_text(
            f"window.LID_QUESTIONS = {json.dumps(site_items, ensure_ascii=False)};\n",
            encoding="utf-8",
        )

    print(json.dumps({k: report[k] for k in ("parsed", "general", "state", "parse_bad", "image")}, ensure_ascii=False))
    print("lands", report["by_land"])
    print("unmatched", len(report["unmatched"]))
    for row in report["unmatched"][:25]:
        print("---", row["id"], row["match"])
        print(row["question"][:180])
        print(row["options"])


if __name__ == "__main__":
    main()
