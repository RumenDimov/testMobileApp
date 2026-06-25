import json
import sys

def validate(path):
    with open(path, encoding='utf-8') as f:
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
