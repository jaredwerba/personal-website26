#!/usr/bin/env python3
"""Bake a public AI26 projection for www.jwerba.com/ai.

Default is hold. A note is published only when it is a building attempt:
the outcome names a software artifact that was built, fixed, or shipped.
Raw prompts, questions, life, health metrics, mail, money, and career admin
never enter the output file. Presence of a sensitive pattern holds the
whole note — this script does not redact-and-publish.

The vault is not copied. Re-run locally:

    python3 scripts/ai26-publish-gate.py
    python3 scripts/ai26-publish-gate.py --self-test
"""

from __future__ import annotations

import argparse
import glob
import json
import os
import re
import sys
from datetime import datetime, timezone

ROOT = os.environ.get("AI26_ROOT", "/Users/jkw/AI26")
DEFAULT_OUT = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "src",
    "data",
    "ai26-public.json",
)

EMAIL = re.compile(r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}")
PHONE = re.compile(r"\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b")
IP = re.compile(r"\b\d{1,3}(?:\.\d{1,3}){3}\b")
SECRET = re.compile(
    r"(?i)("
    r"\b(api[_-]?key|password|passwd|bearer|private key|credential)\b|"
    r"\b(?:sk|ghp|gho|xox[baprs]|AKIA)[_-][A-Za-z0-9]{8,}|"
    r"\.env\b|wrote the key|key was pasted|should rotate|database_url"
    r")"
)
MONEY = re.compile(r"\$\s?\d")
HEALTH = re.compile(
    r"(?i)\b(whoop|hrv|resting heart|heart rate|medication|diagnosis|therapist|"
    r"therapy session|symptom|insomnia|dosage|prescription|sleep|strain|"
    r"recovery score|bpm|calories|workout)\b"
)
LIFE_ADMIN = re.compile(
    r"(?i)\b(rent|lease|landlord|insurance quote|ssn|social security|passport|"
    r"bank account|routing number)\b"
)
STREET = re.compile(
    r"\b\d{1,5}\s+[A-Za-z0-9.'-]+(?:\s+[A-Za-z0-9.'-]+){0,3}\s+"
    r"(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive|Ln|Lane|Way|Ct|Court)\b"
)
CAREER_ADMIN = re.compile(
    r"(?i)\b(résumé|resume|interview|recruiter|job application|apply link|"
    r"salary|compensation|offer letter)\b"
)
# Must appear in the outcome itself. Talked-about plans do not count.
POSITIVE_SHIP = re.compile(
    r"(?i)\b(shipped|built|implemented|fixed|deployed|wired|added|wrote|written|"
    r"refactored|patched|created|committed|pushed|installed|regenerated|removed)\b"
)
HOLD_PHRASE = re.compile(
    r"(?i)("
    r"\b(answered|explained|advice only|recommendation only|verdict|read-only|"
    r"nothing shipped|nothing installed|no application code|no code change|"
    r"did not edit|did not start|waiting to chat|waiting on|located the build|"
    r"screenshot shows|no action taken)\b|"
    r"^delivered\.|"
    r"\bno files\b|"
    r"loaded \d+ orders|"
    r"ai26/raw|/raw/"
    r")"
)
CODE_ARTIFACT = re.compile(
    r"(?i)("
    r"\.(?:py|ts|tsx|js|mjs|css|json|yml|yaml|html|sh)\b|"
    r"\b(?:route|deploy|deployment|component|script|endpoint|schema|harness|"
    r"commit|page|rewrite|module|cli|config|gate|repo|repository|test|"
    r"function|api|ui|build)\b|"
    r"/[a-z0-9][a-z0-9-]{1,32}\b"
    r")"
)
QUESTION_OUTCOME = re.compile(
    r"(?i)^(answered|explained|discussed|deferred|chatted|talked|looked up|"
    r"researched|no change|nothing shipped|held off|waiting)\b"
)

DROP_PROJECTS = {"", "home", "unknown", "e", "none", "<none>"}


def _blob(note: dict) -> str:
    parts = [
        note.get("talked") or "",
        note.get("learned") or "",
        note.get("curious") or "",
        note.get("outcome") or "",
        note.get("why_ai") or "",
        " ".join(note.get("projects") or []),
    ]
    return "\n".join(parts)


def sensitive_reason(text: str) -> str | None:
    checks = (
        (EMAIL, "email"),
        (PHONE, "phone"),
        (IP, "ip"),
        (SECRET, "secret"),
        (MONEY, "money"),
        (HEALTH, "health"),
        (LIFE_ADMIN, "life-admin"),
        (STREET, "address"),
    )
    for pattern, name in checks:
        if pattern.search(text):
            return name
    return None


def classify(note: dict) -> tuple[bool, str]:
    """Return (publish, reason). Publish is the exception."""
    if note.get("event") not in (None, "note"):
        return False, "not-a-note"
    tags = {str(t).lower() for t in (note.get("tags") or [])}
    outcome = re.sub(r"\s+", " ", (note.get("outcome") or "")).strip()
    talked = re.sub(r"\s+", " ", (note.get("talked") or "")).strip()
    if not outcome:
        return False, "empty-outcome"
    if "life" in tags:
        return False, "life-tag"
    reason = sensitive_reason(_blob(note))
    if reason:
        return False, reason
    if CAREER_ADMIN.search(outcome) or CAREER_ADMIN.search(talked):
        if not re.search(r"(?i)\.(?:py|ts|tsx|js|mjs|css)\b|\b(deploy|route|component|script|schema|harness)\b", outcome):
            return False, "career-admin"
    if "code" not in tags and "ops" not in tags:
        return False, "not-build-tag"
    if HOLD_PHRASE.search(outcome):
        return False, "not-a-build"
    if not POSITIVE_SHIP.search(outcome):
        return False, "no-build-verb"
    if not CODE_ARTIFACT.search(outcome):
        return False, "no-artifact"
    if QUESTION_OUTCOME.search(outcome):
        return False, "question"
    line = public_line(outcome)
    if sensitive_reason(line):
        return False, "public-line-sensitive"
    if len(line) < 24:
        return False, "line-too-short"
    return True, "building-attempt"


def public_line(outcome: str) -> str:
    line = re.sub(r"\s+", " ", outcome).strip()
    line = EMAIL.sub("[redacted]", line)
    line = re.sub(r"/Users/jkw/\S+", "[path]", line)
    line = re.sub(r"https?://\S+", lambda m: m.group(0).split("?")[0], line)
    if len(line) > 220:
        line = line[:219].rstrip() + "…"
    return line


def projects_of(note: dict) -> list[str]:
    out = []
    for raw in note.get("projects") or []:
        name = str(raw).strip().strip("/")
        if "/" in name:
            name = name.rstrip("/").split("/")[-1]
        name = name[:40]
        if name.lower() in DROP_PROJECTS:
            continue
        if EMAIL.search(name) or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._+-]{0,39}", name):
            continue
        if name not in out:
            out.append(name)
        if len(out) == 4:
            break
    return out


def load_notes(root: str) -> list[dict]:
    notes = []
    pattern = os.path.join(root, "events", "*", "*", "*.jsonl")
    for path in sorted(glob.glob(pattern)):
        with open(path, encoding="utf-8", errors="replace") as handle:
            for line in handle:
                try:
                    event = json.loads(line)
                except Exception:
                    continue
                if event.get("event") == "note":
                    notes.append(event)
    return notes


def local_time(ts: str) -> str:
    if not ts:
        return ""
    try:
        from datetime import datetime as dt
        from zoneinfo import ZoneInfo

        parsed = dt.fromisoformat(ts.replace("Z", "+00:00")).astimezone(
            ZoneInfo("America/New_York")
        )
        return parsed.strftime("%H:%M")
    except Exception:
        return ""


def bake(notes: list[dict]) -> dict:
    attempts = []
    held = {}
    for note in notes:
        ok, reason = classify(note)
        held[reason] = held.get(reason, 0) + (0 if ok else 1)
        if not ok:
            continue
        attempts.append(
            {
                "date": note.get("local_date") or "",
                "time": local_time(note.get("ts") or ""),
                "projects": projects_of(note),
                "attempt": public_line(note.get("outcome") or ""),
                "tags": [t for t in (note.get("tags") or []) if t in ("code", "ops", "learning")],
            }
        )
    attempts.sort(key=lambda row: (row["date"], row["time"]), reverse=True)
    published_blob = json.dumps(attempts)
    leak = sensitive_reason(published_blob)
    if leak:
        raise SystemExit(f"gate failed closed: published blob matched {leak}")
    return {
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "gate": {
            "rule": "Hold by default. Publish a note only when the outcome names a software artifact that was built, fixed, or shipped. Questions, life, health, mail, money, and career admin stay on the machine.",
            "scanned_notes": len(notes),
            "published": len(attempts),
            "held": len(notes) - len(attempts),
            },
        "attempts": attempts,
    }


FIXTURES = [
    (
        False,
        {
            "event": "note",
            "tags": ["life"],
            "outcome": "Built the lease reminder script in reminders.py",
            "talked": "random question about the apartment",
        },
    ),
    (
        False,
        {
            "event": "note",
            "tags": ["code"],
            "outcome": "Answered the question about how indexes work.",
            "talked": "what is a database index?",
        },
    ),
    (
        False,
        {
            "event": "note",
            "tags": ["code"],
            "outcome": "Shipped the contact page and emailed jared@example.com from the form.",
            "talked": "wire the form",
        },
    ),
    (
        False,
        {
            "event": "note",
            "tags": ["career"],
            "outcome": "Wrote a resume for the interview and saved resume.pdf",
            "talked": "help me prep",
        },
    ),
    (
        False,
        {
            "event": "note",
            "tags": ["code", "ops"],
            "outcome": "Pushed the install script, then opened jkw@192.168.1.10:22.",
            "talked": "install the hook",
        },
    ),
    (
        False,
        {
            "event": "note",
            "tags": ["code"],
            "outcome": "Wrote the key to .env.local and pushed the config change.",
            "talked": "set the key",
        },
    ),
    (
        True,
        {
            "event": "note",
            "local_date": "2026-10-12",
            "tags": ["code"],
            "projects": ["personal-website26"],
            "outcome": "Added the /ai route and the publish gate script. Personal notes stay off the page.",
            "talked": "add the page",
        },
    ),
]


def self_test() -> int:
    failed = 0
    for expect, note in FIXTURES:
        ok, reason = classify(note)
        if ok != expect:
            print(f"FAIL expect={expect} got={ok} reason={reason} outcome={note['outcome'][:80]}")
            failed += 1
        else:
            print(f"ok expect={expect} reason={reason}")
    baked = bake([note for _, note in FIXTURES])
    if baked["gate"]["published"] != 1:
        print(f"FAIL bake published {baked['gate']['published']}")
        failed += 1
    blob = json.dumps(baked)
    if "example.com" in blob or "lease" in blob or "resume.pdf" in blob:
        print("FAIL sensitive fixture leaked into bake")
        failed += 1
    if failed:
        print(f"{failed} failed")
        return 1
    print("self-test passed")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--out", default=DEFAULT_OUT)
    parser.add_argument("--root", default=ROOT)
    args = parser.parse_args()
    if args.self_test:
        return self_test()
    notes = load_notes(args.root)
    payload = bake(notes)
    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2)
        handle.write("\n")
    gate = payload["gate"]
    print(
        f"scanned={gate['scanned_notes']} published={gate['published']} held={gate['held']}"
    )
    print(f"wrote {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
