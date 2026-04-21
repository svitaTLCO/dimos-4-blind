from dimos.assistive.guidance_core import EgocentricSafetyAnalyzer, InstructionPolicy


def test_low_confidence_branch_is_critical() -> None:
    analyzer = EgocentricSafetyAnalyzer()
    policy = InstructionPolicy()

    state = analyzer.analyze(
        forward_clearance_m=2.0,
        confidence=0.2,
        obstacle_bearing_deg=10.0,
        obstacle_distance_m=1.5,
    )
    event = policy.generate(state)

    assert state.reason == "low_confidence"
    assert state.blocked is True
    assert event.priority == "critical"
    assert "stop" in event.text.lower()


def test_hazard_branch_turns_away_from_obstacle() -> None:
    analyzer = EgocentricSafetyAnalyzer()
    policy = InstructionPolicy()

    # Obstacle on the left (+bearing) should suggest a right turn (negative heading)
    state = analyzer.analyze(
        forward_clearance_m=0.6,
        confidence=0.9,
        obstacle_bearing_deg=30.0,
        obstacle_distance_m=0.5,
    )
    event = policy.generate(state)

    assert state.reason == "hazard_detected"
    assert state.blocked is True
    assert state.heading_delta_deg < 0
    assert state.hazard_clock is not None
    assert event.priority == "warning"
    assert "obstacle" in event.text.lower()


def test_clear_path_branch_is_normal() -> None:
    analyzer = EgocentricSafetyAnalyzer()
    policy = InstructionPolicy()

    state = analyzer.analyze(
        forward_clearance_m=3.0,
        confidence=0.95,
        requested_heading_deg=0.0,
    )
    event = policy.generate(state, goal_hint="elevator")

    assert state.reason == "path_clear"
    assert state.blocked is False
    assert event.priority == "normal"
    assert "goal" in event.text.lower()
