from dimos.assistive.skills import AssistiveNavigationSkillContainer


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
