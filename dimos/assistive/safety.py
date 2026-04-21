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


@dataclass
class SensorHealthStatus:
    ok: bool
    degraded: bool
    reason: str
    image_age_s: float | None
    imu_age_s: float | None
    ts: float


@dataclass
class SensorHealthMonitorConfig:
    max_image_age_s: float = 1.5
    max_imu_age_s: float = 1.5


class SensorHealthMonitor:
    """Tracks freshness of sensor streams for degraded-mode decisions."""

    def __init__(self, config: SensorHealthMonitorConfig | None = None) -> None:
        self.config = config or SensorHealthMonitorConfig()
        self._last_image_ts: float | None = None
        self._last_imu_ts: float | None = None

    def record_image(self, ts: float | None = None) -> None:
        self._last_image_ts = time.time() if ts is None else ts

    def record_imu(self, ts: float | None = None) -> None:
        self._last_imu_ts = time.time() if ts is None else ts

    def status(self, now: float | None = None) -> SensorHealthStatus:
        now_ts = time.time() if now is None else now
        image_age = None if self._last_image_ts is None else now_ts - self._last_image_ts
        imu_age = None if self._last_imu_ts is None else now_ts - self._last_imu_ts

        if image_age is None and imu_age is None:
            return SensorHealthStatus(
                ok=False,
                degraded=True,
                reason="no_sensor_data",
                image_age_s=image_age,
                imu_age_s=imu_age,
                ts=now_ts,
            )

        stale_image = image_age is not None and image_age > self.config.max_image_age_s
        stale_imu = imu_age is not None and imu_age > self.config.max_imu_age_s

        degraded = stale_image or stale_imu
        reason = "ok"
        if degraded:
            reasons: list[str] = []
            if stale_image:
                reasons.append("stale_image")
            if stale_imu:
                reasons.append("stale_imu")
            reason = ",".join(reasons)

        return SensorHealthStatus(
            ok=not degraded,
            degraded=degraded,
            reason=reason,
            image_age_s=image_age,
            imu_age_s=imu_age,
            ts=now_ts,
        )


__all__ = [
    "SensorHealthMonitor",
    "SensorHealthMonitorConfig",
    "SensorHealthStatus",
]
