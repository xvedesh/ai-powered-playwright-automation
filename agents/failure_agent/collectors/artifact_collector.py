"""Collector for test result artifact inventory."""

from __future__ import annotations

from pathlib import Path


class ArtifactCollector:
    """Scan test-results for artifact inventory."""

    def __init__(self, test_results_dir: Path) -> None:
        self.test_results_dir = test_results_dir

    def collect(self) -> dict[str, list[str]]:
        """Return a relative directory to file list mapping."""

        if not self.test_results_dir.exists():
            return {}

        inventory: dict[str, list[str]] = {}
        for file_path in self.test_results_dir.rglob("*"):
            if not file_path.is_file():
                continue
            relative_parent = str(file_path.parent.relative_to(self.test_results_dir))
            inventory.setdefault(relative_parent, []).append(str(file_path))

        for files in inventory.values():
            files.sort()
        return inventory
