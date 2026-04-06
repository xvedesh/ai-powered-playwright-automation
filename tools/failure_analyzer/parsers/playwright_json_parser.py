"""Playwright-specific JSON report parser."""

from __future__ import annotations

from typing import Any

from ..models.run_models import (
    CollectedAttachment,
    CollectedResult,
    CollectedRunData,
    CollectedTestCase,
    RunMetadata,
)


class PlaywrightJSONParser:
    """Parse Playwright JSON into framework-agnostic models."""

    def parse(self, payload: dict[str, Any], mode: str) -> CollectedRunData:
        """Parse a Playwright report payload."""

        tests: list[CollectedTestCase] = []
        for suite in payload.get("suites", []):
            tests.extend(self._parse_suite(suite))

        stats = payload.get("stats", {})
        metadata = RunMetadata(
            framework="playwright",
            mode=mode,
            start_time=stats.get("startTime"),
            duration_ms=int(stats.get("duration", 0)),
            total_tests=0,
            failed_tests=int(stats.get("unexpected", 0)),
            flaky_tests=int(stats.get("flaky", 0)),
            skipped_tests=int(stats.get("skipped", 0)),
            expected_tests=int(stats.get("expected", 0)),
            raw_config=payload.get("config", {}),
        )
        metadata.total_tests = len(tests)

        global_errors = [error.get("message", "") for error in payload.get("errors", []) if error.get("message")]
        return CollectedRunData(metadata=metadata, tests=tests, global_errors=global_errors)

    def _parse_suite(self, suite: dict[str, Any]) -> list[CollectedTestCase]:
        tests: list[CollectedTestCase] = []
        for spec in suite.get("specs", []):
            tests.extend(self._parse_spec(spec))
        for child_suite in suite.get("suites", []) or []:
            tests.extend(self._parse_suite(child_suite))
        return tests

    def _parse_spec(self, spec: dict[str, Any]) -> list[CollectedTestCase]:
        tests: list[CollectedTestCase] = []
        for test in spec.get("tests", []):
            results = [self._parse_result(result) for result in test.get("results", [])]
            tests.append(
                CollectedTestCase(
                    framework="playwright",
                    title=spec.get("title", ""),
                    file_path=spec.get("file", ""),
                    project_name=test.get("projectName", ""),
                    project_id=test.get("projectId", ""),
                    status=test.get("status", "unknown"),
                    expected_status=test.get("expectedStatus", "unknown"),
                    ok=bool(spec.get("ok", False)),
                    timeout_ms=int(test.get("timeout", 0)),
                    line=spec.get("line"),
                    column=spec.get("column"),
                    tags=spec.get("tags", []),
                    annotations=test.get("annotations", []),
                    results=results,
                )
            )
        return tests

    def _parse_result(self, result: dict[str, Any]) -> CollectedResult:
        attachments = [
            CollectedAttachment(
                name=attachment.get("name", ""),
                content_type=attachment.get("contentType", "application/octet-stream"),
                path=attachment.get("path"),
                body=attachment.get("body"),
            )
            for attachment in result.get("attachments", [])
        ]
        error = result.get("error") or {}
        return CollectedResult(
            retry=int(result.get("retry", 0)),
            status=result.get("status") or "unknown",
            duration_ms=int(result.get("duration", 0)),
            worker_index=int(result.get("workerIndex", 0)),
            start_time=result.get("startTime"),
            error_message=error.get("message"),
            error_stack=error.get("stack"),
            errors=[entry.get("message", "") for entry in result.get("errors", []) if entry.get("message")],
            stdout=[entry.get("text") or entry.get("buffer", "") for entry in result.get("stdout", [])],
            stderr=[entry.get("text") or entry.get("buffer", "") for entry in result.get("stderr", [])],
            attachments=attachments,
            error_location=result.get("errorLocation"),
            steps=result.get("steps", []) or [],
        )
