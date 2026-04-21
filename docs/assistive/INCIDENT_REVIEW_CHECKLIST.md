# Assistive Navigation Incident Review Checklist

Use this checklist after any supervised corridor evaluation anomaly.

## Session Metadata
- [ ] Date/time captured
- [ ] Session ID logged
- [ ] Device model and app version logged
- [ ] Environment notes (lighting/crowding/noise)

## Safety Event Triage
- [ ] Event type classified (low confidence, stale sensor, hazard miss, ambiguous instruction)
- [ ] User action and outcome documented
- [ ] Whether critical-stop instruction was issued
- [ ] Whether user override was available and used

## Telemetry and Logs
- [ ] Delivery latency events exported
- [ ] Sensor age/health status captured
- [ ] Guidance state and instruction event traces captured
- [ ] Any transport failures recorded

## Root Cause Analysis
- [ ] Primary cause identified
- [ ] Contributing factors identified
- [ ] Reproducibility assessed
- [ ] Risk severity assigned

## Corrective Actions
- [ ] Code/config change identified
- [ ] Test case added for failure mode
- [ ] Rollout guardrail defined
- [ ] Owner + deadline assigned
