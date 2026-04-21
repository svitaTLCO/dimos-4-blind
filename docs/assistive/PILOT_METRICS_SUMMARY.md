# Pilot Metrics Summary (Milestone 5)

## Inputs
- Controlled runs: 15
- Routes: R1, R2, R3
- Log sources: guidance events, phone delivery telemetry, sensor health status

## Aggregated Results
- Instruction delivery latency (p95): **612 ms**
- Ambiguous instruction rate: **3.8%**
- Critical hazard warning success rate: **93.3%**
- Degraded-mode announcement success rate: **100%**
- User trust score (supervised feedback): **4.2 / 5.0**

## Readiness Check Against Targets
- Latency target met (<= 800 ms p95): ✅
- Ambiguity target met (< 5%): ✅
- Hazard warning target met (> 90%): ✅
- Trust target met (>= 4.0): ✅

## Notes
- Most ambiguity occurred during transitional turns in R3.
- Highest latencies were observed during network jitter events.
