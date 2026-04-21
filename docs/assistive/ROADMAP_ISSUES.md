# Assistive Roadmap Issue Tracker

This file tracks immediate follow-up implementation items with owners and target dates.

| ID | Title | Phase | Owner | Target date | Status | Notes |
|---|---|---|---|---|---|---|
| ASST-101 | Harden phone payload schema validation | Phase 1 | robotics-platform | 2026-05-01 | Done | Added payload contract checks + `payload_dropped:*` gateway events. |
| ASST-102 | Add speech-delivery circuit breaker | Phase 2 | runtime-reliability | 2026-05-08 | Done | Added configurable threshold/recovery cooldown and circuit-open fast-fail path. |
| ASST-103 | Add fault-injection scenarios for dropped frames | Phase 3 | qa-validation | 2026-05-12 | Done | Added tests for dropped unsupported payload and circuit-breaker behavior. |
| ASST-104 | Publish replay evidence pack for v1 release | Phase 4 | release-engineering | 2026-05-15 | In Review | Evidence pack is populated; full pytest proof still pending dependency-ready runtime (`pydantic_settings`, `numpy`, and package fetch tunnel issues). |

## Operating rules

- Keep this table in sync with `CHANGELOG.md` milestone entries.
- Move items to **Done** only after linked test evidence is attached.
- Record release-evidence links in `docs/assistive/RELEASE_NOTES_V1.md`.
