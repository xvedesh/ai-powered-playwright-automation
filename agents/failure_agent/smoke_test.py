"""Offline smoke test for the failure analyzer."""

import json
import sys
import tempfile
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from agents.failure_agent.cli import run_analysis
from agents.failure_agent.config import AnalyzerConfig, OpenAIConfig


def main() -> int:
    """Run a local smoke test with a synthetic Playwright failure payload."""

    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        playwright_report = temp_path / "playwright-report.json"
        output_md = temp_path / "fail-analysis.md"
        output_json = temp_path / "fail-analysis.json"
        test_results = temp_path / "test-results"
        test_results.mkdir(parents=True, exist_ok=True)

        payload = {
            "config": {"projects": []},
            "suites": [
                {
                    "title": "suite",
                    "file": "tests/ui-tests/sample.spec.ts",
                    "line": 1,
                    "column": 1,
                    "specs": [
                        {
                            "title": "sample failure",
                            "ok": False,
                            "id": "sample-id",
                            "file": "tests/ui-tests/sample.spec.ts",
                            "line": 3,
                            "column": 5,
                            "tags": [],
                            "tests": [
                                {
                                    "timeout": 30000,
                                    "annotations": [],
                                    "expectedStatus": "passed",
                                    "projectName": "chromium",
                                    "projectId": "chromium",
                                    "status": "unexpected",
                                    "results": [
                                        {
                                            "workerIndex": 0,
                                            "parallelIndex": 0,
                                            "status": "failed",
                                            "duration": 1234,
                                            "error": {
                                                "message": "Timeout 30000ms exceeded while waiting for locator",
                                                "stack": "Error: Timeout 30000ms exceeded while waiting for locator\n    at tests/ui-tests/sample.spec.ts:3:5",
                                            },
                                            "errors": [{"message": "Timeout 30000ms exceeded while waiting for locator"}],
                                            "stdout": [{"text": "navigating to /login"}],
                                            "stderr": [],
                                            "retry": 0,
                                            "startTime": "2026-04-05T00:00:00.000Z",
                                            "attachments": [],
                                            "annotations": [],
                                        }
                                    ],
                                }
                            ],
                        }
                    ],
                    "suites": [],
                }
            ],
            "errors": [],
            "stats": {
                "startTime": "2026-04-05T00:00:00.000Z",
                "duration": 1234,
                "expected": 0,
                "unexpected": 1,
                "flaky": 0,
                "skipped": 0,
            },
        }
        playwright_report.write_text(json.dumps(payload), encoding="utf-8")

        exit_code = run_analysis(
            AnalyzerConfig(
                playwright_report=playwright_report,
                test_results=test_results,
                output_md=output_md,
                output_json=output_json,
                mode="local",
                openai=OpenAIConfig(enabled=False),
            )
        )

        assert exit_code == 0
        assert output_md.exists()
        assert output_json.exists()
        print("Failure analyzer smoke test passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
