"""Framework-agnostic run collection models."""

from dataclasses import dataclass, field
from typing import Any, Dict, Optional


@dataclass
class CollectedAttachment:
    """Normalized attachment metadata."""

    name: str
    content_type: str
    path: Optional[str] = None
    body: Optional[str] = None


@dataclass
class CollectedResult:
    """One execution result for a test, including retries."""

    retry: int
    status: str
    duration_ms: int
    worker_index: int
    start_time: Optional[str]
    error_message: Optional[str]
    error_stack: Optional[str]
    errors: list[str] = field(default_factory=list)
    stdout: list[str] = field(default_factory=list)
    stderr: list[str] = field(default_factory=list)
    attachments: list[CollectedAttachment] = field(default_factory=list)
    error_location: Optional[Dict[str, Any]] = None
    steps: list[dict[str, Any]] = field(default_factory=list)


@dataclass
class CollectedTestCase:
    """Normalized framework test record."""

    framework: str
    title: str
    file_path: str
    project_name: str
    project_id: str
    status: str
    expected_status: str
    ok: bool
    timeout_ms: int
    line: Optional[int]
    column: Optional[int]
    tags: list[str] = field(default_factory=list)
    annotations: list[dict[str, str]] = field(default_factory=list)
    results: list[CollectedResult] = field(default_factory=list)

    @property
    def failing_results(self) -> list[CollectedResult]:
        return [result for result in self.results if result.status not in {"passed", "skipped"}]

    @property
    def final_result(self) -> Optional[CollectedResult]:
        return self.results[-1] if self.results else None


@dataclass
class RunMetadata:
    """Top-level run metadata."""

    framework: str
    mode: str
    start_time: Optional[str]
    duration_ms: int
    total_tests: int
    failed_tests: int
    flaky_tests: int
    skipped_tests: int
    expected_tests: int
    raw_config: dict[str, Any] = field(default_factory=dict)


@dataclass
class CollectedRunData:
    """Collected and parsed run data ready for reasoning."""

    metadata: RunMetadata
    tests: list[CollectedTestCase]
    global_errors: list[str] = field(default_factory=list)
