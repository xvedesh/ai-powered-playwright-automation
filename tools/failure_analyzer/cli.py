"""CLI entrypoint for the failure analyzer."""

import argparse
import os
from pathlib import Path
from typing import List, Optional

from .analyzers.clustering_engine import ClusteringEngine
from .analyzers.deduplication_engine import DeduplicationEngine
from .analyzers.flaky_engine import FlakyEngine
from .analyzers.openai_summary_engine import OpenAISummaryEngine
from .analyzers.per_test_analyzer import PerTestAnalyzer
from .analyzers.summary_engine import SummaryEngine
from .collectors.artifact_collector import ArtifactCollector
from .collectors.log_collector import LogCollector
from .collectors.playwright_report_collector import PlaywrightReportCollector
from .config import AnalyzerConfig, OpenAIConfig
from .models.failure_models import AnalysisReport
from .parsers.playwright_json_parser import PlaywrightJSONParser
from .reporters.json_reporter import JSONReporter
from .reporters.markdown_reporter import MarkdownReporter
from .utils.env_utils import get_bool_env, load_dotenv_if_present


def build_parser() -> argparse.ArgumentParser:
    """Create argument parser."""

    parser = argparse.ArgumentParser(description="Analyze failed test runs and generate diagnostic reports.")
    parser.add_argument("--playwright-report", required=True, type=Path)
    parser.add_argument("--test-results", required=True, type=Path)
    parser.add_argument("--output-md", required=True, type=Path)
    parser.add_argument("--output-json", required=True, type=Path)
    parser.add_argument("--mode", choices=["local", "ci"], default="local")
    parser.add_argument("--log-file", type=Path, default=None)
    return parser


def main(argv: Optional[List[str]] = None) -> int:
    """Run the analyzer CLI."""

    load_dotenv_if_present(Path(".env"))
    args = build_parser().parse_args(argv)
    config = AnalyzerConfig(
        playwright_report=args.playwright_report,
        test_results=args.test_results,
        output_md=args.output_md,
        output_json=args.output_json,
        mode=args.mode,
        log_file=args.log_file,
        openai=OpenAIConfig(
            enabled=_openai_enabled(),
            api_key=os.getenv("OPENAI_API_KEY"),
            model=os.getenv("FAILURE_ANALYZER_OPENAI_MODEL", "gpt-5.4"),
            base_url=os.getenv("FAILURE_ANALYZER_OPENAI_BASE_URL", "https://api.openai.com/v1/responses"),
            timeout_seconds=int(os.getenv("FAILURE_ANALYZER_OPENAI_TIMEOUT_SECONDS", "45")),
        ),
    )
    return run_analysis(config)


def _openai_enabled() -> bool:
    """Determine whether OpenAI enhancement should run."""

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return False
    return get_bool_env("FAILURE_ANALYZER_USE_OPENAI", True)


def run_analysis(config: AnalyzerConfig) -> int:
    """Execute the analyzer pipeline."""

    report_payload = PlaywrightReportCollector(config.playwright_report).collect()
    run_data = PlaywrightJSONParser().parse(report_payload, mode=config.mode)
    failed_tests = [test_case for test_case in run_data.tests if test_case.status in {"unexpected", "flaky"} or test_case.failing_results]

    if not failed_tests:
        print("No failed tests to analyze")
        return 0

    run_log = LogCollector(config.log_file).collect()
    artifact_inventory = ArtifactCollector(config.test_results).collect()

    per_test_analyzer = PerTestAnalyzer()
    analyses = [per_test_analyzer.analyze(test_case, run_log) for test_case in failed_tests]

    flaky_engine = FlakyEngine()
    flaky_signals = [signal for test_case in failed_tests if (signal := flaky_engine.analyze(test_case)) is not None]

    _deduplicated = DeduplicationEngine().summarize(analyses)
    clusters = ClusteringEngine().cluster(analyses)
    summary, priority_fixes = SummaryEngine().summarize(analyses, clusters, flaky_signals)
    ai_summary = OpenAISummaryEngine(config.openai).enrich(
        run_metadata={
            "framework": run_data.metadata.framework,
            "mode": run_data.metadata.mode,
            "start_time": run_data.metadata.start_time,
            "duration_ms": run_data.metadata.duration_ms,
            "total_tests": run_data.metadata.total_tests,
            "failed_tests": run_data.metadata.failed_tests,
            "flaky_tests": run_data.metadata.flaky_tests,
            "skipped_tests": run_data.metadata.skipped_tests,
            "expected_tests": run_data.metadata.expected_tests,
        },
        analyses=analyses,
        clusters=clusters,
        priority_fixes=priority_fixes,
    )

    report = AnalysisReport(
        run_metadata={
            "framework": run_data.metadata.framework,
            "mode": run_data.metadata.mode,
            "start_time": run_data.metadata.start_time,
            "duration_ms": run_data.metadata.duration_ms,
            "total_tests": run_data.metadata.total_tests,
            "failed_tests": run_data.metadata.failed_tests,
            "flaky_tests": run_data.metadata.flaky_tests,
            "skipped_tests": run_data.metadata.skipped_tests,
            "expected_tests": run_data.metadata.expected_tests,
            "global_errors": run_data.global_errors,
            "artifact_directories_scanned": len(artifact_inventory),
            "artifact_file_count": sum(len(files) for files in artifact_inventory.values()),
            "openai_enhancement_enabled": config.openai.enabled,
            "openai_model": config.openai.model if config.openai.enabled else None,
            "playwright_report": str(config.playwright_report),
            "test_results_dir": str(config.test_results),
            "log_file": str(config.log_file) if config.log_file else None,
        },
        summary=summary,
        failed_tests=analyses,
        clusters=clusters,
        flaky_signals=flaky_signals,
        priority_fixes=priority_fixes,
        ai_summary=ai_summary,
    )

    MarkdownReporter().write(config.output_md, report)
    JSONReporter().write(config.output_json, report)

    print(f"Failure analysis report written to {config.output_md}")
    print(f"Machine-readable report written to {config.output_json}")

    if config.mode == "ci":
        print("CI Failure Summary")
        ci_lines = ai_summary.ci_summary if ai_summary and ai_summary.enabled and ai_summary.ci_summary else summary.ci_summary_lines
        for line in ci_lines:
            print(line)

    return 0
