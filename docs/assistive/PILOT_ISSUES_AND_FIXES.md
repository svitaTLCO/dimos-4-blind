# Pilot Issues and Fixes (Milestone 5)

## Top Issues Identified
1. **Ambiguous phrasing in turn transitions**
   - Symptom: user asked for repeat during quick heading updates.
   - Fix: tightened wording in warning branch and repeat behavior.
2. **Occasional late speech delivery spikes**
   - Symptom: >900ms outliers under transient network jitter.
   - Fix: retained timeout controls and surfaced delivery metrics for monitoring.
3. **Conservative degraded-mode interruptions**
   - Symptom: temporary sensor jitter triggered pause more often than ideal.
   - Fix: validated sensor freshness thresholds and incident-review workflow.

## Follow-up Actions
- Add richer turn-context phrasing policy in Milestone 6 backlog.
- Add network-quality tagging to delivery telemetry.
- Re-evaluate freshness thresholds after larger pilot sample size.
