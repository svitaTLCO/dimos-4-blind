# Supervised Corridor Evaluation Scenarios

These scenarios are for Milestone 4 safety hardening checks.

## Scenario 1: Clear Corridor Baseline
- Setup: Well-lit straight corridor, no obstacles.
- Expected: Normal forward instruction, no warning/critical preemption.

## Scenario 2: Near Obstacle Left Side
- Setup: Place obstacle at ~0.6m, left-forward sector.
- Expected: Warning instruction with turn-away guidance.

## Scenario 3: Low Confidence Simulation
- Setup: Degrade confidence input below threshold.
- Expected: Critical stop-and-rescan instruction preempts normal guidance.

## Scenario 4: Stale Sensor Stream
- Setup: Inject sensor age > freshness thresholds.
- Expected: Degraded-mode instruction requesting stop/scan and no movement guidance.

## Scenario 5: Recovery from Degraded Mode
- Setup: Restore fresh sensor data after stale interval.
- Expected: Transition back to normal/warning guidance based on current hazards.
