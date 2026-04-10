"""Run Playwright and post-process failures with the Python analyzer."""

import argparse
import json
import os
import subprocess
import sys
import threading
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from agents.failure_agent.cli import run_analysis
from agents.failure_agent.config import AnalyzerConfig
from agents.failure_agent.config import OpenAIConfig
from agents.failure_agent.utils.env_utils import load_dotenv_if_present


DEFAULT_REPORT = Path("artifacts/playwright-report.json")
DEFAULT_LOG = Path("artifacts/playwright-run.log")
DEFAULT_MD = Path("reports/fail-analysis.md")
DEFAULT_JSON = Path("reports/fail-analysis.json")
DEFAULT_STATUS = Path("reports/fail-analysis.status.json")
DEFAULT_RESULTS = Path("test-results")


def _utc_now() -> str:
    """Return a compact UTC timestamp for wrapper logs."""

    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _artifact_mtime(path: Path) -> Optional[float]:
    """Return the modification time for an artifact path when present."""

    if not path.exists():
        return None
    return path.stat().st_mtime


def _write_status(status_path: Path, stage: str, detail: str, **extra: object) -> None:
    """Persist a small analyzer status file for humans and tooling."""

    status_path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "updated_at": _utc_now(),
        "stage": stage,
        "detail": detail,
        **extra,
    }
    status_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def build_parser() -> argparse.ArgumentParser:
    """Create wrapper argument parser."""

    parser = argparse.ArgumentParser(description="Run Playwright and analyze failures when present.")
    parser.add_argument("--mode", choices=["local", "ci"], default="local")
    parser.add_argument("--playwright-report", type=Path, default=DEFAULT_REPORT)
    parser.add_argument("--test-results", type=Path, default=DEFAULT_RESULTS)
    parser.add_argument("--output-md", type=Path, default=DEFAULT_MD)
    parser.add_argument("--output-json", type=Path, default=DEFAULT_JSON)
    parser.add_argument("--status-file", type=Path, default=DEFAULT_STATUS)
    parser.add_argument("--log-file", type=Path, default=DEFAULT_LOG)
    parser.add_argument("playwright_args", nargs="*", help="Additional arguments passed to playwright test.")
    return parser


def main(argv: Optional[List[str]] = None) -> int:
    """Execute Playwright and trigger analysis only on failure."""

    load_dotenv_if_present(Path(".env"))
    args = build_parser().parse_args(argv)
    args.log_file.parent.mkdir(parents=True, exist_ok=True)
    args.output_md.parent.mkdir(parents=True, exist_ok=True)
    args.output_json.parent.mkdir(parents=True, exist_ok=True)
    args.status_file.parent.mkdir(parents=True, exist_ok=True)

    openai_enabled = bool(os.getenv("OPENAI_API_KEY")) and os.getenv("FAILURE_ANALYZER_USE_OPENAI", "true").strip().lower() in {"1", "true", "yes", "on"}
    openai_config = OpenAIConfig(
        enabled=openai_enabled,
        api_key=os.getenv("OPENAI_API_KEY"),
        model=os.getenv("FAILURE_ANALYZER_OPENAI_MODEL", "gpt-5.4"),
        base_url=os.getenv("FAILURE_ANALYZER_OPENAI_BASE_URL", "https://api.openai.com/v1/responses"),
        timeout_seconds=int(os.getenv("FAILURE_ANALYZER_OPENAI_TIMEOUT_SECONDS", "45")),
    )
    preflight_ok: Optional[bool] = None
    preflight_detail = "not_checked_before_test_run"
    if openai_enabled:
        print(f"[{_utc_now()}] OpenAI enhancement is enabled. Connectivity checks will run only after failures are detected.")

    command = ["npx", "playwright", "test", *args.playwright_args]
    print(f"[{_utc_now()}] Running: {' '.join(command)}")
    _write_status(
        args.status_file,
        stage="running_tests",
        detail="Playwright execution is in progress.",
        command=command,
        openai_enabled=openai_enabled,
    )

    report_mtime_before = _artifact_mtime(args.playwright_report)
    output_md_mtime_before = _artifact_mtime(args.output_md)
    output_json_mtime_before = _artifact_mtime(args.output_json)

    process = subprocess.Popen(
        command,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )

    assert process.stdout is not None
    with args.log_file.open("w", encoding="utf-8") as log_handle:
        log_handle.write(f"[{_utc_now()}] Wrapper started\n")
        log_handle.write(f"[{_utc_now()}] Command: {' '.join(command)}\n")
        for line in process.stdout:
            print(line, end="")
            log_handle.write(line)

    exit_code = process.wait()
    print(f"[{_utc_now()}] Playwright finished with exit code {exit_code}")
    should_analyze = exit_code != 0
    if args.playwright_report.exists():
        try:
            report_payload = json.loads(args.playwright_report.read_text(encoding="utf-8"))
            stats = report_payload.get("stats", {})
            should_analyze = should_analyze or int(stats.get("unexpected", 0)) > 0
        except Exception:
            should_analyze = should_analyze or exit_code != 0

    if not should_analyze:
        _write_status(
            args.status_file,
            stage="completed",
            detail="Playwright completed with no failed tests. No failure analysis was needed.",
            playwright_exit_code=exit_code,
        )
        print("No failed tests to analyze")
        return 0

    report_mtime_after = _artifact_mtime(args.playwright_report)
    if report_mtime_before is not None and report_mtime_after is not None and report_mtime_after <= report_mtime_before:
        print(
            f"[{_utc_now()}] Warning: Playwright report timestamp did not advance at {args.playwright_report}",
            file=sys.stderr,
        )

    print(f"[{_utc_now()}] Starting failure analyzer")
    print(f"[{_utc_now()}] Analysis status file: {args.status_file}")
    print(
        f"[{_utc_now()}] AI report generation is synchronous. If OpenAI enrichment is enabled, allow up to {openai_config.timeout_seconds}s for the summary layer."
    )
    _write_status(
        args.status_file,
        stage="analyzing",
        detail="Failure analysis is running. Reports may not be refreshed yet.",
        playwright_exit_code=exit_code,
        playwright_report=str(args.playwright_report),
        output_md=str(args.output_md),
        output_json=str(args.output_json),
        openai_enabled=openai_enabled,
        openai_preflight_ok=preflight_ok,
        openai_preflight_detail=preflight_detail,
    )

    heartbeat_stop = threading.Event()

    def _analysis_heartbeat() -> None:
        started = time.monotonic()
        while not heartbeat_stop.wait(5):
            elapsed = int(time.monotonic() - started)
            print(f"[{_utc_now()}] Failure analyzer is still running... elapsed={elapsed}s")
            _write_status(
                args.status_file,
                stage="analyzing",
                detail="Failure analysis is still preparing the report.",
                elapsed_seconds=elapsed,
                playwright_exit_code=exit_code,
                playwright_report=str(args.playwright_report),
                output_md=str(args.output_md),
                output_json=str(args.output_json),
                openai_enabled=openai_enabled,
                openai_preflight_ok=preflight_ok,
                openai_preflight_detail=preflight_detail,
            )

    heartbeat_thread = threading.Thread(target=_analysis_heartbeat, daemon=True)
    heartbeat_thread.start()
    try:
        analyzer_exit_code = run_analysis(
            AnalyzerConfig(
                playwright_report=args.playwright_report,
                test_results=args.test_results,
                output_md=args.output_md,
                output_json=args.output_json,
                mode=args.mode,
                log_file=args.log_file,
                openai=openai_config,
            )
        )
    finally:
        heartbeat_stop.set()
        heartbeat_thread.join(timeout=1)

    if analyzer_exit_code != 0:
        _write_status(
            args.status_file,
            stage="failed",
            detail="Failure analyzer did not complete successfully.",
            analyzer_exit_code=analyzer_exit_code,
            playwright_exit_code=exit_code,
        )
        print(f"[{_utc_now()}] Failure analyzer exited with code {analyzer_exit_code}", file=sys.stderr)
    else:
        output_md_mtime_after = _artifact_mtime(args.output_md)
        output_json_mtime_after = _artifact_mtime(args.output_json)
        md_updated = output_md_mtime_after is not None and (
            output_md_mtime_before is None or output_md_mtime_after > output_md_mtime_before
        )
        json_updated = output_json_mtime_after is not None and (
            output_json_mtime_before is None or output_json_mtime_after > output_json_mtime_before
        )
        _write_status(
            args.status_file,
            stage="completed",
            detail="Failure analysis completed successfully.",
            analyzer_exit_code=analyzer_exit_code,
            playwright_exit_code=exit_code,
            markdown_report=str(args.output_md),
            json_report=str(args.output_json),
            md_updated=md_updated,
            json_updated=json_updated,
        )
        print(f"[{_utc_now()}] Analyzer outputs: md_updated={md_updated} json_updated={json_updated}")
        print(f"[{_utc_now()}] Markdown report: {args.output_md}")
        print(f"[{_utc_now()}] JSON report: {args.output_json}")

    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
