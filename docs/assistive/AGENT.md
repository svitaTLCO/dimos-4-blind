# AGENT.md — iPhone Assistive Navigation Workstream

This file defines implementation rules for agents and contributors working on the assistive navigation track.

## Scope
Applies to files under `docs/assistive/` and future implementation files under assistive navigation packages.

## Objective
Build a safe assistive guidance system for blind/low-vision navigation:
- iPhone sensor ingestion,
- natural language request handling,
- concise spoken instruction output,
- safety-first behavior under uncertainty.

## Mandatory Principles
1. **Safety over fluency**: if uncertain, instruct user to stop and re-scan.
2. **Concise voice**: max two short clauses per guidance utterance.
3. **No hidden confidence**: log confidence and fallback reason for each instruction.
4. **Human autonomy**: user can interrupt/stop guidance at any moment.
5. **No robot actuator dependency** in assistive blueprint.

## Coding/Design Guidance
- Keep modules single-purpose and testable.
- Use typed stream contracts.
- Expose user actions through `@skill` methods with strict docstrings and typed args.
- Prefer deterministic safety policy layer before LLM phrasing.
- Keep transport abstraction clean so web/native iPhone clients can be swapped.

## Required Skills (target)
- `start_guidance(goal: str) -> str`
- `pause_guidance() -> str`
- `resume_guidance() -> str`
- `repeat_instruction() -> str`
- `stop_guidance() -> str`
- `set_preference(pref: str) -> str`

## Safety Triggers (must implement)
- Low confidence
- Sensor starvation/stale timestamps
- Contradictory perception outputs
- Unknown environment transition (stairs/curb)

For each trigger, system must emit:
1. Spoken alert,
2. Safe fallback instruction,
3. Structured log event.

## Observability Requirements
Every instruction event should include:
- textual instruction,
- policy reason,
- confidence,
- source sensor status,
- timestamp,
- session id.

## Milestone Discipline
- Keep `docs/assistive/MILESTONE_PLAN.md` updated in every PR.
- Mark completed tasks with `[x]` and include date + initials or author tag.
- Do not mark a task complete without evidence (test, log, or demo artifact).

## Out-of-Scope for initial releases
- Unsupervised street crossing.
- Claims of medical/regulated-grade autonomy.
- Fully unsupervised deployment in unknown crowded environments.
