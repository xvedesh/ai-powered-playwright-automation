"""Collector for execution logs."""

from pathlib import Path
from typing import Optional

from ..utils.file_utils import read_text_if_exists


class LogCollector:
    """Collect runner logs when available."""

    def __init__(self, log_path: Optional[Path]) -> None:
        self.log_path = log_path

    def collect(self) -> Optional[str]:
        """Return log text when present."""

        if self.log_path is None:
            return None
        return read_text_if_exists(self.log_path)
