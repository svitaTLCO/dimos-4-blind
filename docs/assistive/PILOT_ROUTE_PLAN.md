# Controlled Pilot Route Plan (Milestone 5)

## Objective
Run predefined, supervised routes to evaluate instruction quality and safety behavior before broader rollout.

## Route Set
1. **R1 — Straight Hallway**
   - Start: Lobby entrance
   - End: Elevator bank
   - Hazards: none
2. **R2 — Partial Obstruction**
   - Start: Conference corridor
   - End: Kitchen entrance
   - Hazards: static obstacle at left-forward sector
3. **R3 — Dynamic Interruption**
   - Start: Open office aisle
   - End: Exit door
   - Hazards: temporary crossing person + short sensor degradation window

## Supervision Rules
- Human supervisor must be within arm's reach.
- User may stop guidance at any time.
- Abort criteria:
  - two consecutive ambiguous instructions,
  - missing critical warning,
  - stale-sensor degraded mode not announced.

## Trial Matrix
- 3 routes × 5 repetitions each = 15 controlled runs.
- Capture logs for every run:
  - guidance instructions,
  - delivery latencies,
  - sensor health status,
  - incident checklist outcome.
