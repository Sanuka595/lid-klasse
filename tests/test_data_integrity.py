import json
import re
import unittest
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
SITE_DIR = BASE_DIR / "site"

BUNDESLAENDER = {
    "BW", "BY", "BE", "BB", "HB", "HH", "HE", "MV",
    "NI", "NW", "RP", "SL", "SN", "ST", "SH", "TH",
}


class TestDataIntegrity(unittest.TestCase):
    def setUp(self):
        self.json_path = DATA_DIR / "questions.json"
        self.report_path = DATA_DIR / "build-report.json"
        self.site_js_path = SITE_DIR / "questions.js"
        self.glossary_path = SITE_DIR / "glossary.js"
        self.figures_path = SITE_DIR / "figures.js"

    def test_questions_json_exists_and_valid(self):
        self.assertTrue(self.json_path.exists(), "data/questions.json must exist")
        data = json.loads(self.json_path.read_text(encoding="utf-8"))

        self.assertEqual(len(data), 460, "Must contain exactly 460 questions")
        general = [q for q in data if q["land"] is None]
        state = [q for q in data if q["land"] is not None]

        self.assertEqual(len(general), 300, "Must contain exactly 300 general questions")
        self.assertEqual(len(state), 160, "Must contain exactly 160 state questions")

        by_land = {}
        ids = set()
        for q in data:
            self.assertIn("id", q)
            self.assertNotIn(q["id"], ids, f"Duplicate ID: {q['id']}")
            ids.add(q["id"])

            self.assertIn("question", q)
            self.assertTrue(bool(q["question"].strip()), f"Empty question in {q['id']}")

            self.assertIn("options", q)
            self.assertEqual(len(q["options"]), 4, f"Question {q['id']} must have exactly 4 options")
            for i, opt in enumerate(q["options"]):
                self.assertTrue(bool(opt.strip()), f"Empty option {i} in {q['id']}")

            self.assertIn("correct", q)
            self.assertIsInstance(q["correct"], int, f"Question {q['id']} correct index must be int")
            self.assertIn(q["correct"], (0, 1, 2, 3), f"Question {q['id']} correct index must be 0..3")

            land = q["land"]
            if land is not None:
                self.assertIn(land, BUNDESLAENDER, f"Invalid state slug: {land}")
                by_land[land] = by_land.get(land, 0) + 1

        for land in BUNDESLAENDER:
            self.assertEqual(by_land.get(land), 10, f"Bundesland {land} must have 10 questions")

    def test_build_report_valid(self):
        self.assertTrue(self.report_path.exists(), "data/build-report.json must exist")
        report = json.loads(self.report_path.read_text(encoding="utf-8"))
        self.assertEqual(report["parsed"], 460)
        self.assertEqual(report["general"], 300)
        self.assertEqual(report["state"], 160)
        self.assertEqual(report["parse_bad"], 0)
        self.assertEqual(len(report["unmatched"]), 0)

    def test_site_questions_js_valid(self):
        self.assertTrue(self.site_js_path.exists(), "site/questions.js must exist")
        raw = self.site_js_path.read_text(encoding="utf-8")
        self.assertTrue(raw.startswith("window.LID_QUESTIONS = "), "Must assign to window.LID_QUESTIONS")
        json_part = raw.split("window.LID_QUESTIONS = ", 1)[1].rstrip().rstrip(";")
        site_data = json.loads(json_part)
        self.assertEqual(len(site_data), 460)

    def test_glossary_integrity(self):
        self.assertTrue(self.glossary_path.exists(), "site/glossary.js must exist")
        raw = self.glossary_path.read_text(encoding="utf-8")
        json_part = raw.split("window.LID_GLOSSARY = ", 1)[1].rstrip().rstrip(";")
        glossary = json.loads(json_part)
        self.assertGreater(len(glossary), 300)
        terms = set()
        for item in glossary:
            self.assertEqual(len(item), 2)
            term, trans = item[0].strip(), item[1].strip()
            self.assertTrue(bool(term))
            self.assertTrue(bool(trans))
            self.assertNotIn(term.lower(), terms, f"Duplicate glossary term: {term}")
            terms.add(term.lower())

    def test_figures_reference_existing_questions(self):
        self.assertTrue(self.figures_path.exists())
        data = json.loads(self.json_path.read_text(encoding="utf-8"))
        valid_ids = {q["id"] for q in data}
        raw = self.figures_path.read_text(encoding="utf-8")
        # Match keys in byId dictionary, e.g. "g-021": ...
        keys = re.findall(r'"([a-zA-Z]{1,2}-\d{2,3})":', raw)
        for k in keys:
            self.assertIn(k, valid_ids, f"Figure references unknown question ID {k}")


if __name__ == "__main__":
    unittest.main()
