import time

from dimos.assistive.safety import SensorHealthMonitor


def test_sensor_health_monitor_detects_degraded_state() -> None:
    monitor = SensorHealthMonitor()

    now = time.time()
    monitor.record_image(now - 3.0)
    monitor.record_imu(now - 0.1)

    status = monitor.status(now)

    assert status.degraded is True
    assert "stale_image" in status.reason


def test_sensor_health_monitor_ok_state() -> None:
    monitor = SensorHealthMonitor()

    now = time.time()
    monitor.record_image(now - 0.2)
    monitor.record_imu(now - 0.1)

    status = monitor.status(now)

    assert status.ok is True
    assert status.degraded is False
    assert status.reason == "ok"
