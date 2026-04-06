"""Collector for Playwright JSON report files."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from ..utils.file_utils import read_json


class PlaywrightReportCollector:
    """Load a Playwright JSON report from disk."""

    def __init__(self, report_path: Path) -> None:
        self.report_path = report_path

    def collect(self) -> dict[str, Any]:
        """Return parsed JSON report data."""

        if not self.report_path.exists():
            raise FileNotFoundError(f"Playwright report not found: {self.report_path}")
        return read_json(self.report_path)
