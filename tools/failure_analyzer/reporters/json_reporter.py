"""JSON reporter for analysis output."""

from __future__ import annotations

from dataclasses import asdict
from pathlib import Path

from ..models.failure_models import AnalysisReport
from ..utils.file_utils import write_json


class JSONReporter:
    """Persist machine-readable analyzer output."""

    def write(self, output_path: Path, report: AnalysisReport) -> None:
        """Serialize report to JSON."""

        write_json(output_path, asdict(report))
