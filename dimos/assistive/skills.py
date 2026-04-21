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
import time
from typing import Any

import requests

from dimos.agents.annotation import skill
from dimos.assistive.guidance_core import EgocentricSafetyAnalyzer, InstructionPolicy
from dimos.assistive.safety import SensorHealthMonitor
from dimos.core.blueprints import autoconnect
from dimos.core.core import rpc
from dimos.core.module import Module, ModuleConfig
from dimos.core.stream import Out
from dimos.utils.logging_config import setup_logger

logger = setup_logger()


@dataclass
class PhoneSpeakSkillConfig(ModuleConfig):
    endpoint_url: str = "http://127.0.0.1:8900/assistive/speak"
    timeout_s: float = 2.0
    max_text_chars: int = 300
    retry_attempts: int = 3
    retry_backoff_s: float = 0.25
    circuit_breaker_threshold: int = 5
    circuit_breaker_recovery_s: float = 10.0


class PhoneSpeakSkill(Module[PhoneSpeakSkillConfig]):
    """Deliver text instructions to a phone-side speech endpoint and publish telemetry."""

    default_config = PhoneSpeakSkillConfig

    delivery_latency_ms: Out[float]
    delivery_event: Out[str]

    _delivered_count: int
    _failed_count: int
    _last_latency_ms: float | None
    _consecutive_failures: int
    _circuit_open_until_ts: float
    _allowed_priorities: set[str] = {"normal", "warning", "critical"}

    @rpc
    def start(self) -> None:
        super().start()
        self._delivered_count = 0
        self._failed_count = 0
        self._last_latency_ms = None
        self._consecutive_failures = 0
        self._circuit_open_until_ts = 0.0

    @rpc
    def stop(self) -> None:
        super().stop()

    @rpc
    def get_metrics(self) -> dict[str, Any]:
        """Return simple delivery metrics for milestone telemetry checks."""
        return {
            "delivered_count": self._delivered_count,
            "failed_count": self._failed_count,
            "last_latency_ms": self._last_latency_ms,
            "consecutive_failures": self._consecutive_failures,
            "circuit_open_until_ts": self._circuit_open_until_ts,
        }

    @skill
    def speak_to_phone(self, text: str, priority: str = "normal") -> str:
        """Send one spoken instruction to the phone endpoint.

        Args:
            text: Instruction text that should be spoken on the phone.
            priority: Instruction priority level (`normal`, `warning`, or `critical`).
        """
        safe_text = text.strip().replace("\x00", "")
        if not safe_text:
            return "No text provided."

        now = time.time()
        if now < self._circuit_open_until_ts:
            cooldown_s = max(0.0, self._circuit_open_until_ts - now)
            self.delivery_event.publish(f"circuit_open:{cooldown_s:.1f}s")
            return f"Delivery paused by circuit breaker for {cooldown_s:.1f}s"

        safe_priority = priority.strip().lower()
        if safe_priority not in self._allowed_priorities:
            self._failed_count += 1
            self.delivery_event.publish(f"validation_error:invalid_priority:{safe_priority}")
            return (
                "Invalid priority. Expected one of: normal, warning, critical."
            )

        if not self.config.endpoint_url.startswith(("http://", "https://")):
            self._failed_count += 1
            self.delivery_event.publish("validation_error:invalid_endpoint_url")
            return "Invalid endpoint URL."

        if len(safe_text) > self.config.max_text_chars:
            safe_text = safe_text[: self.config.max_text_chars]

        payload = {"text": safe_text, "priority": safe_priority}
        attempts = max(1, int(self.config.retry_attempts))
        backoff_s = max(0.0, float(self.config.retry_backoff_s))
        last_exc: Exception | None = None

        for attempt in range(1, attempts + 1):
            try:
                response = requests.post(
                    self.config.endpoint_url,
                    json=payload,
                    timeout=self.config.timeout_s,
                )
                response.raise_for_status()

                latency_ms = float(response.elapsed.total_seconds() * 1000.0)
                self._last_latency_ms = latency_ms
                self._delivered_count += 1
                self._consecutive_failures = 0

                self.delivery_latency_ms.publish(latency_ms)
                self.delivery_event.publish(f"delivered:{safe_priority}:{latency_ms:.1f}ms")

                return f"Delivered to phone in {latency_ms:.1f}ms"
            except Exception as exc:
                last_exc = exc
                self.delivery_event.publish(
                    f"delivery_retry:{attempt}/{attempts}:{type(exc).__name__}"
                )
                if attempt < attempts and backoff_s > 0.0:
                    time.sleep(backoff_s * attempt)

        self._failed_count += 1
        self._consecutive_failures += 1
        threshold = max(1, int(self.config.circuit_breaker_threshold))
        if self._consecutive_failures >= threshold:
            self._circuit_open_until_ts = time.time() + max(
                0.0,
                float(self.config.circuit_breaker_recovery_s),
            )
            self.delivery_event.publish(
                f"circuit_opened:{self._consecutive_failures}:{self._circuit_open_until_ts:.3f}"
            )
        message = f"delivery_error:{type(last_exc).__name__ if last_exc is not None else 'UnknownError'}"
        self.delivery_event.publish(message)
        logger.warning(f"Phone speech delivery failed: {last_exc}")
        return f"Failed to deliver instruction: {last_exc}"


phone_speak_skill = PhoneSpeakSkill.blueprint


class AssistiveNavigationSkillContainer(Module):
    """Skill container for milestone-3/4 assistive guidance controls."""

    rpc_calls: list[str] = [
        "PhoneSpeakSkill.speak_to_phone",
    ]

    _goal: str | None = None
    _paused: bool = False
    _last_instruction: str | None = None

    def __init__(self) -> None:
        super().__init__()
        self._analyzer = EgocentricSafetyAnalyzer()
        self._policy = InstructionPolicy()
        self._health_monitor = SensorHealthMonitor()

    @rpc
    def start(self) -> None:
        super().start()

    @rpc
    def stop(self) -> None:
        super().stop()

    @rpc
    def sensor_health(self) -> dict[str, Any]:
        """Return sensor-health status for degraded-mode checks."""
        status = self._health_monitor.status()
        return {
            "ok": status.ok,
            "degraded": status.degraded,
            "reason": status.reason,
            "image_age_s": status.image_age_s,
            "imu_age_s": status.imu_age_s,
            "ts": status.ts,
        }

    @skill
    def start_guidance(self, goal: str) -> str:
        """Start assistive guidance toward a textual goal.

        Args:
            goal: Natural-language destination or objective.
        """
        self._goal = goal.strip()
        self._paused = False
        return f"Guidance started for goal: {self._goal}"

    @skill
    def pause_guidance(self) -> str:
        """Pause live guidance output without clearing the current goal."""
        self._paused = True
        return "Guidance paused."

    @skill
    def resume_guidance(self) -> str:
        """Resume live guidance output for the current goal."""
        self._paused = False
        return "Guidance resumed."

    @skill
    def stop_guidance(self) -> str:
        """Stop guidance and clear goal/session state."""
        self._paused = False
        self._goal = None
        self._last_instruction = None
        return "Guidance stopped and goal cleared."

    @skill
    def repeat_instruction(self) -> str:
        """Repeat the last generated guidance instruction."""
        if self._last_instruction is None:
            return "No previous instruction available."

        try:
            speak = self.get_rpc_calls("PhoneSpeakSkill.speak_to_phone")
            speak(self._last_instruction, "normal")
        except Exception:
            logger.warning("PhoneSpeakSkill is not connected for repeat_instruction")

        return self._last_instruction

    @skill
    def update_guidance_from_observation(
        self,
        forward_clearance_m: float,
        confidence: float,
        obstacle_bearing_deg: float = 0.0,
        obstacle_distance_m: float = 999.0,
        sensor_age_s: float = 0.0,
    ) -> str:
        """Generate and optionally deliver the next spoken instruction from safety observations.

        Args:
            forward_clearance_m: Estimated straight-line walkable distance ahead.
            confidence: Confidence in the observation and guidance estimate.
            obstacle_bearing_deg: Obstacle bearing relative to forward axis; positive is left.
            obstacle_distance_m: Estimated obstacle distance in meters.
            sensor_age_s: Age of current sensor bundle in seconds for health monitoring.
        """
        if self._paused:
            return "Guidance is paused."

        now = time.time()
        self._health_monitor.record_image(now - max(sensor_age_s, 0.0))
        self._health_monitor.record_imu(now - max(sensor_age_s, 0.0))

        health = self._health_monitor.status(now)
        if health.degraded:
            degraded_msg = (
                "Sensor stream is degraded. Please stop, hold position, and slowly scan the phone."
            )
            self._last_instruction = degraded_msg
            self._speak_best_effort(degraded_msg, "critical")
            return degraded_msg

        obstacle_bearing = None if obstacle_distance_m >= 998.0 else obstacle_bearing_deg
        obstacle_distance = None if obstacle_distance_m >= 998.0 else obstacle_distance_m

        state = self._analyzer.analyze(
            forward_clearance_m=forward_clearance_m,
            confidence=confidence,
            obstacle_bearing_deg=obstacle_bearing,
            obstacle_distance_m=obstacle_distance,
        )

        # Critical preemption: always send low-confidence safety instruction first.
        event = self._policy.generate(state, goal_hint=self._goal or "")
        self._last_instruction = event.text
        self._speak_best_effort(event.text, event.priority)

        return event.text

    def _speak_best_effort(self, text: str, priority: str) -> None:
        try:
            speak = self.get_rpc_calls("PhoneSpeakSkill.speak_to_phone")
            speak(text, priority)
        except Exception:
            logger.warning("PhoneSpeakSkill is not connected for delivery")


assistive_navigation_skill = AssistiveNavigationSkillContainer.blueprint


assistive_navigation_stack = autoconnect(
    assistive_navigation_skill(),
    phone_speak_skill(),
)


__all__ = [
    "AssistiveNavigationSkillContainer",
    "PhoneSpeakSkill",
    "PhoneSpeakSkillConfig",
    "assistive_navigation_skill",
    "assistive_navigation_stack",
    "phone_speak_skill",
]
