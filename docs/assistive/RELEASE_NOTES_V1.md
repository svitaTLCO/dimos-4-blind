# Assistive Navigation Release Notes (v1 Draft)

## Scope completed

- Phase 1: Boundary validation improvements for phone speech delivery (`priority` and endpoint URL checks).
- Phase 2: Retry/backoff delivery strategy for phone speech endpoint.
- Phase 3: Fault-injection tests for retry and invalid-priority handling.
- Phase 4: Initial release notes and compatibility documentation started in this file.

## Compatibility

- Fork base: current `dev`-derived fork snapshot.
- Upstream compatibility target: keep assistive modules isolated under `dimos/assistive/` to minimize merge risk.

## Validation evidence

- `dimos/assistive/test_skills.py` includes retry success-after-failure coverage.
- `dimos/assistive/test_skills.py` includes invalid-priority rejection coverage.
- Existing guidance/safety/gateway tests remain in place.

## Known follow-ups

- Attach milestone issue IDs to each changelog entry.
- Keep owner/date/status aligned with `docs/assistive/ROADMAP_ISSUES.md`.
- Resolve runtime dependency gaps (`pydantic_settings`, `numpy`, and related stack deps) in CI/dev environment and attach full pytest evidence (current environment also hit tunnel/network fetch errors for PyPI packages).
