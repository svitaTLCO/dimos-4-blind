from datetime import timedelta
from types import SimpleNamespace
from unittest.mock import patch
import sys
import types

if "requests" not in sys.modules:
    requests_stub = types.ModuleType("requests")

    def _post_stub(*_args, **_kwargs):  # type: ignore[no-untyped-def]
        raise RuntimeError("requests.post stub invoked without patch")

    requests_stub.post = _post_stub  # type: ignore[attr-defined]
    sys.modules["requests"] = requests_stub

from dimos.assistive.skills import AssistiveNavigationSkillContainer
from dimos.assistive.skills import PhoneSpeakSkill


class _Speaker:
    def __init__(self) -> None:
        self.calls = []

    def __call__(self, text: str, priority: str) -> str:
        self.calls.append((text, priority))
        return "ok"


def test_guidance_controls_and_repeat() -> None:
    skill = AssistiveNavigationSkillContainer()
    speaker = _Speaker()
    skill.get_rpc_calls = lambda *_args: speaker  # type: ignore[assignment]

    assert "started" in skill.start_guidance("elevator").lower()
    assert "paused" in skill.pause_guidance().lower()
    assert "paused" in skill.update_guidance_from_observation(2.0, 0.9).lower()
    assert "resumed" in skill.resume_guidance().lower()

    generated = skill.update_guidance_from_observation(
        forward_clearance_m=0.7,
        confidence=0.9,
        obstacle_bearing_deg=20.0,
        obstacle_distance_m=0.6,
    )

    repeated = skill.repeat_instruction()
    assert repeated == generated
    assert len(speaker.calls) >= 2


def test_stop_guidance_clears_state() -> None:
    skill = AssistiveNavigationSkillContainer()
    skill.start_guidance("exit")
    skill.update_guidance_from_observation(3.0, 0.95)

    assert "cleared" in skill.stop_guidance().lower()
    assert "no previous" in skill.repeat_instruction().lower()


class _Collector:
    def __init__(self) -> None:
        self.values: list[object] = []

    def publish(self, value: object) -> None:
        self.values.append(value)


def _make_response(elapsed_s: float = 0.05) -> SimpleNamespace:
    response = SimpleNamespace()
    response.elapsed = timedelta(seconds=elapsed_s)
    response.raise_for_status = lambda: None
    return response


def test_phone_speak_skill_retries_then_succeeds() -> None:
    skill = PhoneSpeakSkill()
    skill.start()
    skill.delivery_event = _Collector()  # type: ignore[assignment]
    skill.delivery_latency_ms = _Collector()  # type: ignore[assignment]
    skill.config.retry_attempts = 3
    skill.config.retry_backoff_s = 0.0

    call_count = {"n": 0}

    def _flaky_post(*_args, **_kwargs):  # type: ignore[no-untyped-def]
        call_count["n"] += 1
        if call_count["n"] < 3:
            raise RuntimeError("temporary outage")
        return _make_response()

    with patch("dimos.assistive.skills.requests.post", side_effect=_flaky_post):
        result = skill.speak_to_phone("Turn left", "warning")

    assert "delivered" in result.lower()
    assert call_count["n"] == 3
    assert skill.get_metrics()["delivered_count"] == 1
    assert any(
        isinstance(event, str) and event.startswith("delivery_retry:")
        for event in skill.delivery_event.values
    )


def test_phone_speak_skill_rejects_invalid_priority() -> None:
    skill = PhoneSpeakSkill()
    skill.start()
    skill.delivery_event = _Collector()  # type: ignore[assignment]
    skill.delivery_latency_ms = _Collector()  # type: ignore[assignment]

    with patch("dimos.assistive.skills.requests.post") as post_mock:
        result = skill.speak_to_phone("Test", "urgent")

    assert "invalid priority" in result.lower()
    assert post_mock.called is False
    assert skill.get_metrics()["failed_count"] == 1


def test_phone_speak_skill_circuit_breaker_opens_after_failures() -> None:
    skill = PhoneSpeakSkill()
    skill.start()
    skill.delivery_event = _Collector()  # type: ignore[assignment]
    skill.delivery_latency_ms = _Collector()  # type: ignore[assignment]
    skill.config.retry_attempts = 1
    skill.config.circuit_breaker_threshold = 2
    skill.config.circuit_breaker_recovery_s = 30.0

    with patch("dimos.assistive.skills.requests.post", side_effect=RuntimeError("down")):
        first = skill.speak_to_phone("A", "normal")
        second = skill.speak_to_phone("B", "normal")

    assert "failed to deliver" in first.lower()
    assert "failed to deliver" in second.lower()
    assert skill.get_metrics()["consecutive_failures"] == 2

    blocked = skill.speak_to_phone("C", "normal")
    assert "circuit breaker" in blocked.lower()
