# Copyright 2026 Dimensional Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from __future__ import annotations

from dataclasses import dataclass
import math
import time


@dataclass
class GuidanceState:
    """Assistive guidance state produced from egocentric safety analysis."""

    heading_delta_deg: float
    forward_clearance_m: float
    hazard_clock: str | None
    hazard_distance_m: float | None
    caution_level: str
    blocked: bool
    confidence: float
    reason: str
    ts: float


@dataclass
class InstructionEvent:
    """Instruction event emitted by policy for voice output."""

    text: str
    priority: str
    reason: str
    confidence: float
    ts: float


@dataclass
class EgocentricSafetyAnalyzerConfig:
    min_safe_clearance_m: float = 1.2
    critical_obstacle_distance_m: float = 0.8
    low_confidence_threshold: float = 0.45
    evasive_turn_deg: float = 30.0


class EgocentricSafetyAnalyzer:
    """Converts near-field sensor estimates into a safety state."""

    def __init__(self, config: EgocentricSafetyAnalyzerConfig | None = None) -> None:
        self.config = config or EgocentricSafetyAnalyzerConfig()

    def analyze(
        self,
        *,
        forward_clearance_m: float,
        confidence: float,
        obstacle_bearing_deg: float | None = None,
        obstacle_distance_m: float | None = None,
        requested_heading_deg: float = 0.0,
    ) -> GuidanceState:
        ts = time.time()

        if confidence < self.config.low_confidence_threshold:
            return GuidanceState(
                heading_delta_deg=0.0,
                forward_clearance_m=forward_clearance_m,
                hazard_clock=self._bearing_to_clock(obstacle_bearing_deg),
                hazard_distance_m=obstacle_distance_m,
                caution_level="critical",
                blocked=True,
                confidence=confidence,
                reason="low_confidence",
                ts=ts,
            )

        too_close = obstacle_distance_m is not None and (
            obstacle_distance_m <= self.config.critical_obstacle_distance_m
        )
        insufficient_clearance = forward_clearance_m < self.config.min_safe_clearance_m

        if too_close or insufficient_clearance:
            return GuidanceState(
                heading_delta_deg=self._evasive_heading(obstacle_bearing_deg),
                forward_clearance_m=forward_clearance_m,
                hazard_clock=self._bearing_to_clock(obstacle_bearing_deg),
                hazard_distance_m=obstacle_distance_m,
                caution_level="warning",
                blocked=True,
                confidence=confidence,
                reason="hazard_detected",
                ts=ts,
            )

        return GuidanceState(
            heading_delta_deg=requested_heading_deg,
            forward_clearance_m=forward_clearance_m,
            hazard_clock=None,
            hazard_distance_m=None,
            caution_level="normal",
            blocked=False,
            confidence=confidence,
            reason="path_clear",
            ts=ts,
        )

    def _evasive_heading(self, obstacle_bearing_deg: float | None) -> float:
        if obstacle_bearing_deg is None:
            return self.config.evasive_turn_deg

        # Positive bearing means obstacle is to the left; turn right.
        return -self.config.evasive_turn_deg if obstacle_bearing_deg > 0 else self.config.evasive_turn_deg

    def _bearing_to_clock(self, obstacle_bearing_deg: float | None) -> str | None:
        if obstacle_bearing_deg is None:
            return None

        normalized = ((obstacle_bearing_deg + 180.0) % 360.0) - 180.0
        hour = int(round(normalized / 30.0))
        hour = (12 + hour) % 12
        return f"{12 if hour == 0 else hour} o'clock"


@dataclass
class InstructionPolicyConfig:
    low_confidence_phrase: str = "I'm uncertain. Please stop and slowly scan left and right."
    default_forward_phrase: str = "Path looks clear. Walk forward carefully."


class InstructionPolicy:
    """Generate concise, safety-first speech instructions from guidance state."""

    def __init__(self, config: InstructionPolicyConfig | None = None) -> None:
        self.config = config or InstructionPolicyConfig()

    def generate(self, state: GuidanceState, goal_hint: str = "") -> InstructionEvent:
        ts = time.time()

        if state.reason == "low_confidence" or state.confidence < 0.45:
            return InstructionEvent(
                text=self.config.low_confidence_phrase,
                priority="critical",
                reason="low_confidence",
                confidence=state.confidence,
                ts=ts,
            )

        if state.blocked:
            hazard_text = "Obstacle ahead"
            if state.hazard_clock is not None:
                hazard_text = f"Obstacle at {state.hazard_clock}"

            distance_text = ""
            if state.hazard_distance_m is not None:
                distance_text = f" about {state.hazard_distance_m:.1f} meters"

            turn_dir = "right" if state.heading_delta_deg < 0 else "left"
            text = (
                f"{hazard_text}{distance_text}. Stop. Turn {turn_dir} "
                f"{abs(state.heading_delta_deg):.0f} degrees, then continue slowly."
            )
            return InstructionEvent(
                text=text,
                priority="warning",
                reason=state.reason,
                confidence=state.confidence,
                ts=ts,
            )

        heading_text = ""
        if math.fabs(state.heading_delta_deg) >= 10.0:
            heading = "right" if state.heading_delta_deg < 0 else "left"
            heading_text = f" Veer {heading} {abs(state.heading_delta_deg):.0f} degrees."

        goal_text = f" Goal: {goal_hint}." if goal_hint else ""

        return InstructionEvent(
            text=f"{self.config.default_forward_phrase}{heading_text}{goal_text}".strip(),
            priority="normal",
            reason=state.reason,
            confidence=state.confidence,
            ts=ts,
        )


__all__ = [
    "EgocentricSafetyAnalyzer",
    "EgocentricSafetyAnalyzerConfig",
    "GuidanceState",
    "InstructionEvent",
    "InstructionPolicy",
    "InstructionPolicyConfig",
]
