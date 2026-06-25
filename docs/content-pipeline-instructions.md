# Content Generation Pipeline — Instructions for AI Coding Workflow

**Purpose:** Generate quiz content for the remaining 15 Care Certificate standards and the chosen NVQ track, following the exact pattern already proven in `cc-standard-10.json`. This file is the spec — feed it directly to Aider/DeepSeek as the task brief.

**Ground truth example:** `src/db/seed/care-certificate/cc-standard-10.json` (Standard 10: Safeguarding Adults, 15 questions). Every output file must match this file's structure, tone, and quality bar exactly. When in doubt about format, defer to that file, not to this document's prose.

---

## 1. Non-negotiable rules (apply to every standard, every question)

1. **Source from the official Skills for Care PDF only.** Never source question content from third-party sites (DSDWEB, Care Skills Training, Lead Academy, Royal Open College, or similar "Care Certificate answers" sites), even to cross-check. Those sites may contain outdated criteria, paraphrasing errors, or content not aligned to the March 2025 update.
2. **Every question needs a `source_criterion` field** naming the exact official criterion it was built from (e.g. `"10.1a Explain the term 'safeguarding adults'"`). If you cannot trace a question back to a specific numbered criterion in the official PDF, do not include the question.
3. **Exactly 4 answer options per question, exactly 1 marked `is_correct: true`.** No exceptions. This is mechanically validated (see Section 5).
4. **Every question needs a non-empty `explanation`.** The explanation is the product's core differentiator — it must explain *why* the answer is correct in plain English, not just restate the answer. Never leave this blank or generic ("This is correct because it is the right answer" is not acceptable).
5. **Plain English throughout.** Assume the reader may be studying in English as a second or additional language. Avoid jargon in the question and options; if a technical/legal term is essential (e.g. "safeguarding adults board", "duty of care"), it's fine to use it, but the explanation should make its meaning clear in context.
6. **Never write content that could be copy-pasted directly into an NVQ workbook or Care Certificate workbook as a learner's own answer.** Questions test understanding via multiple choice; they are not a substitute for the learner's own written workbook answers. This is a study/practice tool, not an answer-writing service.
7. **Plausible wrong answers, not joke answers.** Wrong options should represent genuine misunderstandings or common mistakes, not absurd distractors — this is what makes the quiz actually test understanding rather than just process of elimination.
8. **Aim for 12–18 questions per topic.** Fewer than 12 likely means a standard's outcomes weren't all covered; more than 18 starts to feel like a burden for a 10-minute study session. Standard 10 used 15 as a working benchmark.

---

## 2. Step-by-step pipeline per Care Certificate standard

Repeat this for each of Standards 1–9 and 11–16 (Standard 10 is already done).

### Step 1 — Fetch the official source
Fetch the standard's official PDF from:
```
https://www.skillsforcare.org.uk/resources/documents/Developing-your-workforce/Care-Certificate/Care-Certificate-Standards/Standard-{N}.pdf
```
Replace `{N}` with the standard number (1, 2, 3 … 16).

Cross-check against the combined master document if the individual standard PDF seems incomplete or you want to confirm criteria numbering:
```
https://www.skillsforcare.org.uk/resources/documents/Developing-your-workforce/Care-Certificate/Care-Certificate-Standards/Care-Certificate-standards-March-2025.pdf
```

Also check this change-log to confirm you're not building against pre-2025 criteria for a standard that changed:
```
https://www.skillsforcare.org.uk/resources/documents/Developing-your-workforce/Care-Certificate/Care-Certificate-Standards/Summary-of-changes-to-Care-Certificate-standards-March-2025.pdf
```

**Known title/numbering note:** the 2025 update has 16 standards (a new Standard on learning disability and autism awareness was added). If a fetched standard's title or numbering doesn't match what you expect, stop and flag it rather than guessing — the standard numbers may have shifted from older (pre-2025) documentation still circulating online.

### Step 2 — Extract the assessment criteria
Each official workbook lists numbered "Activity" sections (e.g. Activity 10.1a, 10.1b) tied to outcome statements using verbs like *describe, explain, list, identify, demonstrate*. Extract every criterion number and its outcome statement into a working list before writing any questions — this list is your coverage checklist for Step 3.

### Step 3 — Draft questions
For each criterion (or closely related small group of criteria, e.g. 10.1e & h together), draft 1–2 multiple-choice questions following the Standard 10 file's pattern exactly:
- `id`: `cc{N}-q{NN}` (e.g. `cc3-q01`)
- `source_criterion`: the criterion number + outcome text
- `prompt`: the question
- `options`: array of 4, one `is_correct: true`
- `explanation`: plain-English reasoning

Use Standard 10's questions as direct structural templates — same tone, same level of plain-English explanation, same balance of definitional questions (what does X mean) and applied/scenario questions (what should you do if X happens).

### Step 4 — Self-check before output
Before finalizing each file, verify:
- [ ] Every criterion from Step 2's checklist is covered by at least one question (note any deliberately skipped criteria — e.g. purely practical/observed criteria with no knowledge-test equivalent — in a comment, don't silently drop them)
- [ ] Every question has exactly 4 options and exactly 1 correct answer
- [ ] No question's wording matches any third-party site's wording (you should not have visited one, but double-check no training-data leakage produced suspiciously familiar phrasing)
- [ ] JSON is valid and matches the schema in Section 4

### Step 5 — Output file
Write to: `src/db/seed/care-certificate/cc-standard-{N}.json`

Use this exact topic block, adjusting fields per standard:
```json
{
  "topic": {
    "id": "cc-standard-{N}",
    "qualification_id": "care-certificate",
    "title": "Standard {N}: {Official Title}",
    "summary": "{One-sentence plain-English summary of what this standard covers}",
    "sort_order": {N},
    "is_free": {0 or 1 — see note below}
  },
  "questions": [ ... ]
}
```

**`is_free` note:** leave this as `0` (locked/paid) for all newly generated standards unless told otherwise. The free-tier boundary is a product decision (per the Screens & Build Sequence doc, Phase 3) to be set deliberately once all content exists — don't decide it implicitly by defaulting to free.

---

## 3. Step-by-step pipeline for the NVQ/RQF track

The NVQ track works the same way but the source differs structurally, so follow this adjusted version.

### Step 1 — Confirm the awarding body (open item)
Per the Technical Specification's open items list, the launch awarding body for the NVQ Level 2/3 Adult Care content is **not yet confirmed**. Do not start NVQ content generation until this is decided — flag it back rather than guessing. Likely candidates: City & Guilds, NCFE, Highfield. Once confirmed, locate that awarding body's public **unit specification / qualification handbook** (search `"[awarding body name] Level 2 Adult Care qualification specification"`), which lists unit titles, learning outcomes, and assessment criteria in the same public, citable format as the Skills for Care documents.

### Step 2 — Treat each unit as a "topic", same as a Care Certificate standard
Map: awarding-body unit → `topics` row. Learning outcome/assessment criterion → `source_criterion`. Everything else in Sections 1, 2 (Steps 2–4), and 4 of this document applies identically.

### Step 3 — Output file
Write to: `src/db/seed/nvq-level-2-3/{unit-id}.json`, using the same JSON shape, with `"qualification_id": "nvq-l2-3"`.

### Step 4 — Note on depth
NVQ units are typically denser and more formally worded than Care Certificate standards (this is the "academic phrasing" gap flagged in the Product Brief's persona research). Lean even harder into plain-English explanations here — this is exactly the audience segment (settled, English-confident-but-formal-language-unfamiliar workers, per persona "David") this content needs to serve well.

---

## 4. Schema reference (must match exactly)

```
topics:           id, qualification_id, title, summary, sort_order, is_free
questions:         id, topic_id, source_criterion, prompt, explanation, sort_order
answer_options:    id, question_id, label, is_correct, sort_order
```

Seed JSON shape (as used in `cc-standard-10.json`):
```json
{
  "topic": { "id": "...", "qualification_id": "...", "title": "...", "summary": "...", "sort_order": 0, "is_free": 0 },
  "questions": [
    {
      "id": "...",
      "source_criterion": "...",
      "prompt": "...",
      "options": [
        { "label": "...", "is_correct": true },
        { "label": "...", "is_correct": false },
        { "label": "...", "is_correct": false },
        { "label": "...", "is_correct": false }
      ],
      "explanation": "..."
    }
  ]
}
```
(`topic_id`, `question_id`, and `answer_options.id`/`sort_order` are derived at seed-load time from this nested structure — no need to write them out flat in the source JSON.)

---

## 5. Validation script

Run this after generating each file, before moving to the next standard. Save as `scripts/validate-seed.py` and run `python3 scripts/validate-seed.py <path-to-json>`.

```python
import json
import sys

def validate(path):
    with open(path) as f:
        data = json.load(f)

    errors = []
    topic = data.get("topic", {})
    questions = data.get("questions", [])

    required_topic_fields = ["id", "qualification_id", "title", "summary", "sort_order", "is_free"]
    for field in required_topic_fields:
        if field not in topic:
            errors.append(f"topic missing field: {field}")

    if len(questions) < 12:
        errors.append(f"only {len(questions)} questions — expected at least 12")
    if len(questions) > 18:
        errors.append(f"{len(questions)} questions — expected at most 18 (reconsider scope)")

    seen_ids = set()
    for q in questions:
        qid = q.get("id", "UNKNOWN")
        if qid in seen_ids:
            errors.append(f"{qid}: duplicate question id")
        seen_ids.add(qid)

        if not q.get("source_criterion"):
            errors.append(f"{qid}: missing source_criterion")
        if not q.get("prompt"):
            errors.append(f"{qid}: missing prompt")
        if not q.get("explanation"):
            errors.append(f"{qid}: missing explanation")

        options = q.get("options", [])
        if len(options) != 4:
            errors.append(f"{qid}: has {len(options)} options, expected 4")
        correct_count = sum(1 for o in options if o.get("is_correct") is True)
        if correct_count != 1:
            errors.append(f"{qid}: has {correct_count} correct answers, expected exactly 1")

    if errors:
        print(f"FAILED: {path}")
        for e in errors:
            print(" -", e)
        sys.exit(1)
    else:
        print(f"PASSED: {path} ({len(questions)} questions)")

if __name__ == "__main__":
    validate(sys.argv[1])
```

A file that fails this script should not be considered done — fix it before generating the next standard, rather than batching fixes at the end.

---

## 6. Suggested run order

1. Standards 1, 2, 3 — foundational ("Understand Your Role", "Personal Development", "Duty of Care") — lower content risk, good for confirming the pipeline holds up across multiple files before scaling.
2. Standards 4–9, 11–16 — remaining standards, any order.
3. NVQ track — only after the awarding body is confirmed (Section 3, Step 1).

Suggested prompt to give Aider per standard, once this document is in the repo:
> "Follow `docs/content-pipeline-instructions.md` Section 2 to generate Standard {N}. Use `cc-standard-10.json` as the structural template. Validate with `scripts/validate-seed.py` before telling me it's done."

---

## 7. What this pipeline deliberately does not do

- It does not decide the free/paid split across standards — that stays a deliberate human decision.
- It does not generate Mock Exam question pools directly — those are assembled later (Build Sequence Phase 2/3) by drawing from the per-topic question banks this pipeline produces, not generated as separate content.
- It does not replace the two human review steps from Product Brief §7.2: accuracy review against source criteria, and a frontline-experience sense-check. Running this pipeline produces a draft ready for that review — not launch-ready content on its own.
