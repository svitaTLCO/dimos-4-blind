# Changelog

All notable fork-specific changes will be documented in this file.

## [Unreleased]

### Added
- Fork-level `readme.md` describing fork rationale, current implementation status, and development roadmap.
- Code-focused implementation summary covering assistive modules under `dimos/assistive/`.
- Assistive release-notes draft at `docs/assistive/RELEASE_NOTES_V1.md` with compatibility and validation notes.
- Replay evidence template at `docs/assistive/REPLAY_EVIDENCE_PACK_V1.md`.

### Changed
- Reframed fork planning into an implementation-first roadmap (stabilize, integrate, validate, release).
- Added validation and retry/backoff behavior to `PhoneSpeakSkill.speak_to_phone`.
- Added fault-injection coverage for speech delivery retries and invalid priorities.
- Added circuit-breaker protection for repeated speech delivery failures.
- Added payload schema validation and gateway drop events for unsupported payloads.
- Added base dependency declaration for `requests` to align runtime imports in assistive skills.

### Next
- Close dependency/runtime setup gaps (`pydantic_settings`, `numpy`, related stack deps) and attach full pytest evidence to the replay evidence pack.
