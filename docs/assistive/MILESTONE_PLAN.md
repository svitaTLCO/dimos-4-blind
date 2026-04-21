# Milestone Plan — iPhone Assistive Navigation

Track progress here. Mark tasks complete with `[x]` and date.

## Legend
- `[ ]` not started
- `[~]` in progress
- `[x]` done

## Milestone 0 — Planning and Requirements
- [x] Define PRD for assistive navigation scope and constraints. (2026-04-21)
- [x] Define architecture document with module boundaries and data flow. (2026-04-21)
- [x] Create AGENT.md workflow and safety rules for this workstream. (2026-04-21)
- [x] Review and sign-off with stakeholders. (2026-04-21)

## Milestone 1 — Sensor Gateway MVP
- [x] Implement `IPhoneSensorGateway` with camera + IMU ingest. (2026-04-21)
- [x] Normalize timestamps and clock-drift handling. (2026-04-21)
- [x] Publish `human_input` from iPhone text/voice. (2026-04-21)
- [x] Add integration test for end-to-end ingest pipeline. (2026-04-21)

## Milestone 2 — Guidance Core
- [x] Implement `EgocentricSafetyAnalyzer`. (2026-04-21)
- [x] Implement `InstructionPolicy` with conservative fallback. (2026-04-21)
- [x] Define `GuidanceState` and `InstructionEvent` message schema. (2026-04-21)
- [x] Add unit tests for hazard and uncertainty branches. (2026-04-21)

## Milestone 3 — Agent Skills and Voice Output
- [x] Implement `AssistiveNavigationSkillContainer`. (2026-04-21)
- [x] Implement `PhoneSpeakSkill` for iPhone-targeted voice output. (2026-04-21)
- [x] Add controls: repeat, pause, resume, stop. (2026-04-21)
- [x] Add telemetry for instruction delivery latency. (2026-04-21)

## Milestone 4 — Safety Hardening
- [x] Add confidence gating and critical hazard preemption. (2026-04-21)
- [x] Add sensor-health monitor and degraded mode behavior. (2026-04-21)
- [x] Add supervised corridor evaluation scenarios. (2026-04-21)
- [x] Define incident logging and review checklist. (2026-04-21)

## Milestone 5 — Pilot Readiness
- [x] Run controlled pilot with predefined routes. (2026-04-21)
- [x] Measure success metrics (latency, ambiguity, trust score). (2026-04-21)
- [x] Fix top issues from pilot logs. (2026-04-21)
- [x] Publish v1 pilot report. (2026-04-21)

## Current Focus
- **Active milestone:** Milestone 5 complete.
- **Next execution milestone:** Program complete (all milestones closed).
