# Architecture: iPhone Assistive Navigation on DimOS

## 1) Architectural Intent
Adapt DimOS from robot-actuation-centric operation to human guidance operation, while preserving:
- module boundaries,
- typed streams,
- skill-based tool calling,
- blueprint composition.

## 2) High-Level Data Flow

```text
[iPhone Sensors/App]
  ├─ RGB Frames
  ├─ IMU (accel/gyro)
  ├─ Depth/LiDAR (optional by phase)
  └─ Voice/Text Request
          |
          v
+-----------------------+
| IPhoneSensorGateway   |
+-----------------------+
   | color_image / imu / depth / human_input
   v
+-----------------------+      +-----------------------+
| Scene Understanding   | ---> | Egocentric Safety     |
| (objects, free space) |      | Analyzer              |
+-----------------------+      +-----------------------+
             \                     /
              \                   /
               v                 v
             +-----------------------+
             | Instruction Policy    |
             | (safety-first prompt) |
             +-----------------------+
                        |
                        v
             +-----------------------+
             | PhoneSpeakSkill       |
             | (text->voice endpoint)|
             +-----------------------+
                        |
                        v
                 [iPhone Audio]
```

## 3) Modules and Responsibilities

## 3.1 IPhoneSensorGateway (new)
Responsibilities:
- Accept and decode iPhone payloads.
- Publish normalized streams:
  - `color_image`
  - `imu`
  - `depth_image` (if available)
  - `human_input`
- Validate timestamps and drop stale frames.

## 3.2 Scene Understanding (new or adapted)
Responsibilities:
- Estimate walkable corridor and obstacle candidates.
- Track near-field hazards relevant to immediate walking path.
- Emit confidence scores with each result.

## 3.3 EgocentricSafetyAnalyzer (new)
Responsibilities:
- Convert perception outputs into actionable safety state:
  - blocked direction
  - suggested heading delta
  - caution level
- Enforce conservative behavior under uncertainty.

## 3.4 InstructionPolicy (new)
Responsibilities:
- Convert task intent + safety state into concise instruction text.
- Limit verbosity and instruction complexity.
- Apply deterministic policies for urgent hazards.

## 3.5 AssistiveNavigationSkillContainer (new)
Responsibilities:
- Expose user-facing tools:
  - `start_guidance(goal: str)`
  - `repeat_instruction()`
  - `pause_guidance()`
  - `resume_guidance()`
  - `stop_guidance()`
- Coordinate with policy and speech modules.

## 3.6 PhoneSpeakSkill (new)
Responsibilities:
- Deliver spoken instructions to iPhone endpoint.
- Support retries and optional local fallback.
- Track delivery ack latency.

## 4) Agent and Skill Strategy
Use existing DimOS agent orchestration for intent-to-tool routing.
- Agent ingests user requests from `human_input`.
- Agent calls assistive skills rather than robot movement skills.
- Keep tool descriptions explicit about safety constraints.

## 5) Blueprint Composition (new)
Proposed blueprint: `iphone-assistive-agentic`

Includes:
1. `iphone_sensor_gateway()`
2. `agent()`
3. `assistive_navigation_skill()`
4. `phone_speak_skill()`
5. Optional debug modules (web input, telemetry, rerun bridge)

## 6) Message Contracts (draft)

## 6.1 `GuidanceState`
- `heading_delta_deg: float`
- `forward_clearance_m: float`
- `hazard_clock: str` (e.g., "1 o'clock")
- `hazard_distance_m: float | None`
- `confidence: float`
- `ts: float`

## 6.2 `InstructionEvent`
- `text: str`
- `priority: str` (`normal|warning|critical`)
- `reason: str`
- `confidence: float`
- `ts: float`

## 7) Safety Architecture
- Confidence gating before issuing movement suggestions.
- Critical hazard channel preempts normal navigation instructions.
- Mandatory stop-and-clarify branch under low confidence.
- User override command processed with highest priority.

## 8) Failure Modes and Mitigations
1. **Sensor dropout** -> announce degraded mode and pause movement guidance.
2. **ASR misrecognition** -> confirmation loop for destination-critical intents.
3. **Perception uncertainty** -> conservative instruction: stop, scan, reorient.
4. **Speech delivery failure** -> fallback to text + repeated audio attempts.

## 9) Observability
- Structured logs:
  - sensor health
  - policy decisions
  - spoken message timeline
  - confidence and fallback events
- Per-session trace id for replay and incident analysis.

## 10) Security/Privacy Considerations
- Minimize sensor retention by default.
- Allow configurable redaction and retention windows.
- Encrypt iPhone transport channel.
- Explicit user consent for audio/video capture.
