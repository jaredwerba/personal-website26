#!/usr/bin/env python3
"""Build the public AI26 page for www.jwerba.com/ai.

Same layout as the local vault page. Personal use does not ship: life, health,
money, mail, home network, career admin, and anything else too personal for
the public internet. The local site/index.html is not touched.

    python3 scripts/ai26-public-site.py
    python3 scripts/ai26-public-site.py --self-test
"""

from __future__ import annotations

import importlib.util
import os
import re
import sys
from collections import Counter

ROOT = os.environ.get("AI26_ROOT", "/Users/jkw/AI26")
SITE_PY = os.path.join(ROOT, "bin", "ai26-site.py")
OUT = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "public",
    "ai26.html",
)

EMAIL = re.compile(r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}")
PHONE = re.compile(r"\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b")
IP = re.compile(r"\b\d{1,3}(?:\.\d{1,3}){3}\b")
PRIVATE_IP = re.compile(
    r"\b(?:10|192\.168|172\.(?:1[6-9]|2\d|3[01]))\.\d{1,3}\.\d{1,3}\b"
)
SECRET = re.compile(
    r"(?i)(\b(api[_-]?key|password|passwd|bearer|private key|credential)\b|"
    r"\b(?:sk|ghp|gho|xox[baprs]|AKIA)[_-][A-Za-z0-9]{8,}|"
    r"\.env\b|wrote the key|key was pasted|should rotate)"
)
MONEY = re.compile(r"\$\s?\d")
HEALTH = re.compile(
    r"(?i)\b(whoop|hrv|resting heart|heart rate|medication|diagnosis|therapist|"
    r"therapy|symptom|insomnia|dosage|prescription|sleep|strain|"
    r"recovery score|bpm|calories|clinic|doctor)\b"
)
LIFE = re.compile(
    r"(?i)\b(rent|lease|landlord|insurance|ssn|social security|passport|"
    r"bank account|routing number|apartment|roommate|dating|girlfriend|"
    r"boyfriend|breakup|my mom|my dad|my wife|my husband)\b"
)
STREET = re.compile(
    r"\b\d{1,5}\s+[A-Za-z0-9.'-]+(?:\s+[A-Za-z0-9.'-]+){0,3}\s+"
    r"(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive|Ln|Lane|Way|Ct|Court)\b"
)
CAREER = re.compile(
    r"(?i)\b(résumé|resume|interview\w*|recruiter|salary|compensation|offer letter)\b"
)
HOME = re.compile(r"/Users/jkw\b\S*")


def too_personal(text: str, tags=None) -> str | None:
    if tags and "life" in {str(t).lower() for t in tags}:
        return "life-tag"
    checks = (
        (EMAIL, "email"),
        (PHONE, "phone"),
        (PRIVATE_IP, "home-network"),
        (SECRET, "secret"),
        (MONEY, "money"),
        (HEALTH, "health"),
        (LIFE, "life"),
        (STREET, "address"),
        (CAREER, "career-admin"),
    )
    for pattern, name in checks:
        if pattern.search(text or ""):
            return name
    return None


def clean(text: str) -> str:
    text = EMAIL.sub("[redacted]", text or "")
    text = HOME.sub("[path]", text)
    text = re.sub(r"~/[^\s<]+", "[path]", text)
    text = IP.sub("[redacted]", text)
    text = PHONE.sub("[redacted]", text)
    text = MONEY.sub("[redacted]", text)
    return text


def load_site():
    spec = importlib.util.spec_from_file_location("ai26_site", SITE_PY)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def filter_days(site) -> tuple[dict, dict]:
    raw = site.load_days()
    kept = {}
    stats = Counter()
    for day, data in raw.items():
        stats["days_in"] += 1
        notes = []
        for note in data["notes"]:
            stats["notes_in"] += 1
            blob = "\n".join(
                [
                    note.get("talked") or "",
                    note.get("learned") or "",
                    note.get("curious") or "",
                    note.get("outcome") or "",
                    note.get("why_ai") or "",
                ]
            )
            reason = too_personal(blob, note.get("tags"))
            if reason:
                stats["notes_" + reason] += 1
                continue
            stats["notes_kept"] += 1
            notes.append(
                {
                    **note,
                    "talked": clean(note.get("talked") or ""),
                    "learned": clean(note.get("learned") or ""),
                    "curious": clean(note.get("curious") or ""),
                    "outcome": clean(note.get("outcome") or ""),
                    "why_ai": clean(note.get("why_ai") or ""),
                }
            )
        prompts = []
        # Raw prompts are the questions themselves. They do not ship.
        # Kept notes already passed the personal filter and carry the context.
        if not notes and not prompts:
            stats["days_dropped"] += 1
            continue
        stats["days_kept"] += 1
        kept[day] = {
            "prompts": len(prompts),
            "replies": 0,
            "tools": 0,
            "sessions": set(range(max(len(prompts), 1 if notes else 0))),
            "sources": Counter(),
            "projects": Counter(p for _, _, p, _ in prompts),
            "notes": notes,
            "first_prompts": prompts,
            "_seen_sessions": set(),
        }
    return kept, stats


def filter_bullets(bullets) -> tuple[list, int]:
    kept = []
    dropped = 0
    for day, text in bullets:
        if too_personal(text):
            dropped += 1
            continue
        kept.append((day, clean(text)))
    return kept, dropped


def render(site, days, learnings, curios) -> str:
    day_list = sorted(days)
    if not day_list:
        raise SystemExit("filter removed every day; refusing to publish an empty vault")
    font_css = ""
    font_path = os.path.join(ROOT, "site", "assets", "ocr-a.css")
    if os.path.exists(font_path):
        font_css = open(font_path, encoding="utf-8").read()
    from datetime import date, datetime
    from zoneinfo import ZoneInfo

    tot_prompts = sum(d["prompts"] for d in days.values())
    tot_sessions = sum(len(d["sessions"]) for d in days.values())
    tot_notes = sum(len(d["notes"]) for d in days.values())
    peak_days = {
        d
        for d, _ in sorted(days.items(), key=lambda kv: -kv[1]["prompts"])[:3]
    }
    first_d, last_d = date.fromisoformat(day_list[0]), date.fromisoformat(day_list[-1])
    months, month_html = site.build_months(day_list, days, peak_days)
    profile = site.build_profile(day_list, days)
    cards = "\n".join(
        site.build_day_card(d, days[d], i, len(day_list), i != len(day_list) - 1)
        for i, d in enumerate(day_list)
    )
    chips = "\n".join(
        '<button class="chip%s" data-date="%s" role="tab" aria-selected="%s"><b>%d</b><i>%s</i></button>'
        % (
            " on" if d == day_list[-1] else "",
            d,
            "true" if d == day_list[-1] else "false",
            date.fromisoformat(d).day,
            site.MON3[date.fromisoformat(d).month],
        )
        for d in day_list[-10:]
    )
    gen_ts = datetime.now(ZoneInfo("America/New_York")).strftime("%Y-%m-%d %H:%M %Z")
    page = site.PAGE_TMPL % {
        "font_css": font_css,
        "sub_span": "%s %d – %s %d 2026"
        % (site.MON3[first_d.month], first_d.day, site.MON3[last_d.month], last_d.day),
        "tot_sessions": tot_sessions,
        "tot_prompts": "{:,}".format(tot_prompts),
        "tot_notes": tot_notes,
        "n_days": len(day_list),
        "profile": profile,
        "months": month_html,
        "mon_last": site.MONTH_NAMES[int(months[-1][5:7])] + " " + months[-1][:4],
        "chips": chips,
        "cards": cards,
        "learn": site.build_learn(learnings),
        "n_learn": len(learnings),
        "curio": site.build_curio(curios),
        "n_curio": len(curios),
        "stats": site.build_stats(days, len(learnings), len(curios)),
        "sums": (
            '<div class="warn"><b>SUMMARIES</b> stay on the machine. '
            "This copy keeps work notes and drops personal use.</div>"
        ),
        "days_json": __import__("json").dumps(day_list),
        "months_json": __import__("json").dumps(months),
        "gen_ts": gen_ts,
    }
    page = page.replace(
        '<meta name="theme-color"',
        '<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">\n'
        '<meta name="theme-color"',
        1,
    )
    page = page.replace(
        "EVERY SESSION LOGGED",
        "PUBLIC COPY · PERSONAL NOTES HELD · NOT INDEXED",
    )
    page = page.replace("SOURCE: /Users/jkw/AI26", "SOURCE: LOCAL VAULT")
    page = page.replace("/Users/jkw", "[path]")
    return page


def assert_clean(html: str) -> None:
    leaks = {
        "robots": "noindex, nofollow" not in html,
        "email": bool(EMAIL.search(html)),
        "private-ip": bool(PRIVATE_IP.search(html)),
        "phone": bool(PHONE.search(html)),
        "money": bool(MONEY.search(html)),
        "health": bool(HEALTH.search(html)),
        "life": bool(LIFE.search(html)),
        "address": bool(STREET.search(html)),
        "home-path": "/Users/jkw" in html,
    }
    bad = [name for name, hit in leaks.items() if hit]
    if bad:
        raise SystemExit("public page failed the personal filter: " + ", ".join(bad))


def self_test() -> int:
    cases = [
        ("Built the lease script", True),
        ("Shipped the /ai route and the gate script.", False),
        ("HRV was 42 and sleep was short", True),
        ("Ping 192.168.1.1 from the laptop", True),
    ]
    failed = 0
    for text, personal in cases:
        got = too_personal(text) is not None
        if got != personal:
            print("FAIL", text, "got", got)
            failed += 1
        else:
            print("ok", personal)
    return 1 if failed else 0


def main() -> int:
    if "--self-test" in sys.argv:
        return self_test()
    site = load_site()
    days, stats = filter_days(site)
    learnings, learn_dropped = filter_bullets(
        site.load_bullets(os.path.join(ROOT, "learnings.md"))
    )
    curios, curio_dropped = filter_bullets(
        site.load_bullets(os.path.join(ROOT, "curiosity.md"))
    )
    html = render(site, days, learnings, curios)
    assert_clean(html)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as handle:
        handle.write(html)
    print(
        "wrote",
        OUT,
        "days",
        stats["days_kept"],
        "dropped",
        stats["days_dropped"],
        "notes",
        stats["notes_kept"],
        "/",
        stats["notes_in"],
        "prompts",
        stats["prompts_kept"],
        "/",
        stats["prompts_in"],
        "learn_dropped",
        learn_dropped,
        "curio_dropped",
        curio_dropped,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
