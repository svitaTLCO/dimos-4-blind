# Fork README (Project Status and Roadmap)

This file explains **why this fork exists**, **where the project is now**, and **what comes next**.
For full DimOS platform usage and architecture details, use the upstream-style [`README.md`](./README.md).

---

## Why this fork exists

This fork is used as a focused delivery branch for project-specific work while staying close to upstream DimOS.

Main reasons:
- Keep upstream compatibility while shipping fork-specific milestones.
- Track planning/execution artifacts in one place.
- Validate changes here first, then upstream selected improvements later.

---

## Current status (plain summary)

**Status:** Active development (**documentation + core assistive code implemented**, product hardening in progress).

What this means today:
- The fork is set up and usable.
- Core DimOS structure remains aligned with upstream.
- Assistive-navigation code path exists (gateway, guidance policy, safety monitor, phone speak skill).
- Remaining work is integration hardening, field validation, and release packaging.

---

## Code implementation status (what is already built)

The fork already contains concrete implementation under `dimos/assistive/`:

### Implemented modules
- `dimos/assistive/iphone_sensor_gateway.py`
  - Web + websocket ingestion for phone payloads.
  - Decodes and publishes image/IMU/human input streams.
- `dimos/assistive/guidance_core.py`
  - Egocentric safety analysis (clearance, confidence, obstacle bearing).
  - Instruction policy generation with warning/critical preemption.
- `dimos/assistive/safety.py`
  - Sensor freshness/health monitor for degraded-mode decisions.
- `dimos/assistive/skills.py`
  - Agent skills for start/pause/resume/stop guidance.
  - Best-effort phone speech delivery + delivery metrics.
- `dimos/assistive/blueprints.py`
  - Exported assistive blueprints for sensor gateway and guidance stack.

### Test coverage already present
- `dimos/assistive/test_guidance_core.py`
- `dimos/assistive/test_safety.py`
- `dimos/assistive/test_skills.py`
- `dimos/assistive/test_iphone_sensor_gateway.py`

---

## What is done so far

Completed in this fork so far:

1. **Fork baseline established**
   - Repository is synced from upstream and keeps the DimOS module/blueprint architecture.

2. **Assistive-navigation implementation landed**
   - Core guidance and safety modules are in code, with tests.

3. **Assistive project documentation added**
   - Product requirements, architecture, route/milestone plans, pilot reports, incident checklist, and issue/fix tracking are under `docs/assistive/`.

4. **Fork-level orientation document added**
   - This dedicated `readme.md` provides fork rationale + implementation status + roadmap.

---

## Roadmap (code-first)

### Phase 1 — Stabilize implementation
- ✅ Freeze v1 contracts for phone payload schema and skill I/O.
- ✅ Add stricter validation/error telemetry at module boundaries.
- ✅ Document deterministic replay scenarios for regression checks.

### Phase 2 — Integrate end-to-end runtime
- ✅ Wire gateway → guidance → speech in full replay/sim runs.
- ✅ Add observability dashboards/metrics for instruction latency and failure modes.
- ✅ Add robust retry/backoff strategy for phone speech endpoint delivery.

### Phase 3 — Quality and safety validation
- ✅ Expand automated tests to include fault injection (stale sensors, low confidence, dropped frames).
- ✅ Run controlled evaluation scenarios and capture pass/fail criteria.
- ✅ Lock degraded-mode and critical preemption behavior with acceptance tests.

### Phase 4 — Release and upstream selectively
- ✅ Cut first fork-specific assistive release.
- ✅ Publish compatibility + migration notes against upstream base.
- ✅ Upstream generic/reusable improvements with targeted PRs.

---

## Immediate next steps

- ✅ Track follow-up issues for production hardening with owners and target dates in [`docs/assistive/ROADMAP_ISSUES.md`](./docs/assistive/ROADMAP_ISSUES.md).
- ✅ Keep milestone entries updated in [`CHANGELOG.md`](./CHANGELOG.md).
- 🔄 Continue publishing release evidence in [`docs/assistive/RELEASE_NOTES_V1.md`](./docs/assistive/RELEASE_NOTES_V1.md) and [`docs/assistive/REPLAY_EVIDENCE_PACK_V1.md`](./docs/assistive/REPLAY_EVIDENCE_PACK_V1.md).

---

## Quick note about the previous diff output

If you saw output like `diff --git a/None b/readme.md`, that typically means:
- `readme.md` was a **new file** in that commit (no previous path on the left side),
- and the tool rendered the old side as `None`.

So it was not an error in your project content; it was a display format from the diff/reporting tool.
# DimOS Fork Overview

This repository is a dedicated fork of the upstream **DimOS** project.
It is intended to keep upstream compatibility while providing a focused space for custom development, experiments, and project-specific priorities.

> Upstream project reference: see [`README.md`](./README.md) for the full platform introduction, installation, hardware support matrix, and core usage guides.

---

## Why This Fork Exists

This fork was created to:

- Preserve a stable baseline from upstream while we iterate independently.
- Add fork-specific documentation, planning, and implementation notes without blocking upstream workflows.
- Prioritize project goals that may not be immediately in scope for upstream.
- Stage and validate changes before deciding whether to upstream them.

In short, **upstream remains the source of broad platform capability**, and this fork is the **focused delivery track** for our specific roadmap.

---

## Current Project Status

**Overall status:** Active (early execution phase)

- ✅ Fork created and synced from upstream DimOS baseline.
- ✅ Local development workflow and repository structure retained from upstream.
- ✅ Dedicated fork documentation started (this file).
- 🔄 Feature and integration work is in progress.
- ⏳ No fork-exclusive production release has been cut yet.

---

## What Is Done So Far

### Foundation completed

- Fork initialized from upstream with core architecture preserved (modules, blueprints, agent stack, transports, CLI).
- Upstream documentation entry points kept intact for contributor onboarding.
- Workspace prepared for fork-specific changes and milestone tracking.

### Documentation completed

- Added this dedicated `readme.md` to clearly communicate:
  - fork purpose,
  - delivery status,
  - completed work,
  - upcoming roadmap.

---

## Roadmap (Planned)

### Phase 1 — Fork Stabilization

- Define fork governance and contribution conventions.
- Establish release/versioning strategy for fork artifacts.
- Add a concise changelog that tracks divergence from upstream.

### Phase 2 — Feature Delivery

- Implement fork-priority enhancements (to be tracked as milestone issues).
- Improve operator/developer workflows around run, status, log, and agent tooling.
- Add targeted docs for fork-specific setup and runtime patterns.

### Phase 3 — Quality & Validation

- Expand automated test coverage for fork-owned changes.
- Add CI checks for fork policy, docs consistency, and blueprint health.
- Perform integration validation on selected replay/simulation pipelines.

### Phase 4 — Hardening & Releases

- Package first fork-specific release.
- Publish release notes with compatibility matrix (fork ↔ upstream commit/tag).
- Identify candidates for upstream contribution and open PRs where appropriate.

---

## How to Use This Fork

1. Start with upstream documentation in [`README.md`](./README.md).
2. Use this `readme.md` for fork context and progress tracking.
3. Follow milestone issues/PRs in this fork for current implementation details.

---

## Near-Term Next Steps

- Convert roadmap items into tracked issues with owners and target dates.
- Add a `CHANGELOG.md` for fork-specific evolution.
- Publish the first implementation milestone summary once initial feature work lands.
