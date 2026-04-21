# Product Requirements Document (PRD)
# iPhone Assistive Navigation (DimOS)

## 1) Overview
Build an assistive navigation system for blind and low-vision users using iPhone sensors as the primary input source and spoken guidance as the primary output modality.

The system must convert natural language requests (for example: "take me to the elevator" or "guide me to the exit") into safe, concise, context-aware voice instructions.

## 2) Problem Statement
Existing DimOS blueprints and skills are centered on robot hardware, robot perception, and robot actuation. We need a human-centered mode that:
- uses iPhone camera + IMU + optional depth/LiDAR,
- reasons over user intent and environmental hazards,
- provides reliable voice prompts for walking guidance,
- does **not** rely on robot actuators.

## 3) Goals
1. Ingest iPhone sensor streams in near-real time.
2. Interpret user intent from voice/text requests.
3. Generate short, directional, safety-first spoken instructions.
4. Keep architecture compatible with DimOS modules/skills/blueprints.
5. Provide traceable progress via milestone plan and completion checklist.

## 4) Non-Goals (v1)
- Full autonomous legal-level navigation certification.
- Outdoor city-scale routing with traffic-light understanding.
- Independent crossing without user confirmation.
- Replacing cane/dog; this is an assistive layer.

## 5) Users and Use Cases
### Primary users
- Blind and low-vision users navigating indoor spaces.

### Core use cases
- "Guide me to the elevator"
- "Avoid stairs"
- "Where is the nearest open corridor?"
- "Repeat the last instruction"
- "Stop guidance now"

## 6) Functional Requirements
### FR-1 Sensor Ingestion
- System accepts iPhone streams:
  - RGB camera (required)
  - IMU (accelerometer + gyroscope) (required)
  - Depth/LiDAR when available (phase-based)
  - Microphone input for user requests

### FR-2 Intent Understanding
- Convert natural language request into task intent:
  - destination/subgoal
  - constraints (avoid stairs/crowds/noise)
  - urgency and confirmation needs

### FR-3 Guidance Generation
- Produce concise, stepwise spoken instructions.
- Include obstacle/hazard alerts and confidence status.
- Use deterministic safety fallback for low confidence.

### FR-4 Voice Output
- Provide spoken output to iPhone endpoint.
- Support "repeat" and "slow down" controls.

### FR-5 Session Control
- Start, pause, resume, and stop guidance.
- Keep conversation and navigation context during a session.

### FR-6 Observability
- Emit structured events for instruction, hazard, uncertainty, and fallback.
- Persist logs for offline review and model/policy tuning.

## 7) Safety Requirements
1. If uncertainty exceeds threshold, issue explicit stop instruction.
2. Avoid over-long speech; each instruction must be concise.
3. Include explicit hazard direction and relative distance when known.
4. Require confirmation for risky transitions (stairs, curb, crossing).
5. Maintain immediate user override command: "stop guidance now".

## 8) Quality Attributes
- Latency target (sensor-to-speech): <= 800 ms p95 for indoor guidance events.
- Availability target (active session): >= 99.0% during guided runs.
- Prompt length target: <= 2 short clauses per message.
- Explainability: each guidance event stores reason + confidence.

## 9) Success Metrics
- M1: End-to-end demo with camera+IMU -> spoken instructions.
- M2: > 90% successful hazard warning in controlled obstacle course.
- M3: < 5% ambiguous instruction rate in pilot evaluations.
- M4: User-reported trust score >= 4.0/5 in supervised trials.

## 10) Risks
- Sensor quality variability across iPhone models.
- Depth availability and calibration differences.
- Noisy audio environments affecting ASR accuracy.
- Over-trust risk if assistant sounds too confident.

## 11) Dependencies
- DimOS agent + skill runtime.
- Audio STT/TTS stack.
- iPhone data transport layer (web/native bridge).
- Optional mapping/perception models for environment semantics.

## 12) Rollout Strategy
1. Internal corridor tests (supervised only).
2. Controlled pilot with scripted destinations.
3. Expanded pilot with supervised free-form requests.
4. Incremental safety hardening based on logs and incident reviews.

## 13) Acceptance Criteria (v1)
- User can request a goal by voice.
- System responds with ongoing spoken directional instructions.
- System detects at least basic frontal obstacles and warns.
- System supports repeat/stop reliably.
- Logs can reconstruct each guidance decision.
