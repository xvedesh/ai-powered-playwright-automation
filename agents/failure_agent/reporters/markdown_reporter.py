"""Markdown reporter for human-readable analysis."""

from __future__ import annotations

from pathlib import Path

from ..models.failure_models import AnalysisReport, FailedTestAnalysis
from ..utils.file_utils import write_text


class MarkdownReporter:
    """Render the failure analysis report in Markdown."""

    def write(self, output_path: Path, report: AnalysisReport) -> None:
        """Write Markdown report."""

        lines: list[str] = ["# Fail Analysis Report", ""]
        lines.extend(self._ai_enhanced_summary(report))
        lines.extend(self._executive_summary(report))
        lines.extend(self._shared_clusters(report))
        lines.extend(self._per_test_details(report))
        lines.extend(self._flaky_signals(report))
        lines.extend(self._priority_fix_queue(report))
        write_text(output_path, "\n".join(lines).rstrip() + "\n")

    def _ai_enhanced_summary(self, report: AnalysisReport) -> list[str]:
        ai_summary = report.ai_summary
        lines = ["## AI-Enhanced Summary"]
        if not ai_summary:
            return lines + ["- OpenAI enhancement not configured. Offline rule-based analysis only.", ""]
        if not ai_summary.enabled:
            status_line = f"- OpenAI enhancement unavailable. Status: {ai_summary.status}"
            error_line = f"- Error: {ai_summary.error}" if ai_summary.error else None
            output = [status_line]
            if error_line:
                output.append(error_line)
            output.append("")
            return lines + output

        lines.extend(
            [
                f"- Provider: {ai_summary.provider}",
                f"- Model: {ai_summary.model}",
                f"- Executive narrative: {ai_summary.executive_summary}",
                f"- Grouped patterns: {ai_summary.grouped_patterns}",
                f"- Priority recommendations: {ai_summary.priority_recommendations}",
                "",
            ]
        )
        return lines

    def _executive_summary(self, report: AnalysisReport) -> list[str]:
        summary = report.summary
        lines = [
            "## Executive Summary",
            f"- Total tests analyzed: {summary.total_tests_analyzed}",
            f"- Total failed tests: {summary.total_failed_tests}",
            f"- Grouped by category: {summary.categories}",
            f"- Grouped by project/browser: {summary.projects}",
            f"- Grouped by likely ownership: {summary.ownership}",
            f"- Top recurring root causes: {', '.join(summary.top_recurring_root_causes) if summary.top_recurring_root_causes else 'None'}",
            f"- Top priority recommendations: {', '.join(summary.top_priority_recommendations) if summary.top_priority_recommendations else 'None'}",
            "",
        ]
        return lines

    def _shared_clusters(self, report: AnalysisReport) -> list[str]:
        lines = ["## Shared Failure Clusters"]
        if not report.clusters:
            return lines + ["- No shared clusters detected.", ""]
        for cluster in report.clusters:
            lines.extend(
                [
                    f"### {cluster.name}",
                    f"- Likely shared root cause: {cluster.likely_root_cause}",
                    f"- Affected tests: {', '.join(cluster.affected_tests)}",
                    f"- Confidence: {cluster.confidence}",
                    f"- Recommended next action: {cluster.recommended_next_action}",
                ]
            )
        lines.append("")
        return lines

    def _per_test_details(self, report: AnalysisReport) -> list[str]:
        lines = ["## Per-Test Detailed Analysis"]
        for analysis in report.failed_tests:
            lines.extend(self._one_test(analysis))
        lines.append("")
        return lines

    def _one_test(self, analysis: FailedTestAnalysis) -> list[str]:
        evidence = analysis.evidence
        recommendations = analysis.recommendations
        return [
            f"### {analysis.identity.title} [{analysis.identity.project}]",
            f"- File: {analysis.identity.file_path}",
            f"- Retry index: {analysis.identity.retry_index}",
            f"- Final status: {analysis.identity.final_status}",
            f"- Duration: {analysis.identity.duration_ms} ms",
            f"- Failure type: {', '.join(analysis.categories)}",
            f"- Confidence: {analysis.confidence}",
            f"- Ownership: {analysis.ownership}",
            f"- Likely root cause: {analysis.probable_root_cause}",
            f"- Why this is likely: {analysis.rationale}",
            f"- Alternative possibilities: {', '.join(analysis.alternatives) if analysis.alternatives else 'None'}",
            f"- Key error lines: {evidence.get('key_error_lines')}",
            f"- Stack trace fragments: {evidence.get('stack_trace_fragments')}",
            f"- Log fragments: {evidence.get('log_fragments')}",
            f"- Attachment references: {evidence.get('attachment_references')}",
            f"- Artifact paths: {evidence.get('artifact_paths')}",
            f"- Retry behavior: {evidence.get('retry_behavior')}",
            f"- Likely test fix: {recommendations.test_fix}",
            f"- Likely framework fix: {recommendations.framework_fix}",
            f"- Likely environment/infra fix: {recommendations.environment_fix}",
            f"- Likely product/app issue: {recommendations.product_fix}",
            f"- Stabilization suggestion: {recommendations.stabilization}",
        ]

    def _flaky_signals(self, report: AnalysisReport) -> list[str]:
        lines = ["## Flakiness Signals"]
        if not report.flaky_signals:
            return lines + ["- No flaky signals detected.", ""]
        for signal in report.flaky_signals:
            lines.extend(
                [
                    f"### {signal.test_name} [{signal.project}]",
                    f"- Why it is suspected: {', '.join(signal.reasons)}",
                    f"- Suggested stabilization action: {signal.recommendation}",
                ]
            )
        lines.append("")
        return lines

    def _priority_fix_queue(self, report: AnalysisReport) -> list[str]:
        lines = ["## Priority Fix Queue"]
        if not report.priority_fixes:
            return lines + ["- No priority fixes generated.", ""]
        for fix in report.priority_fixes:
            lines.extend(
                [
                    f"- {fix.priority} {fix.title}",
                    f"  Rationale: {fix.rationale}",
                    f"  Impact: {fix.impact}",
                    f"  Ownership: {fix.ownership}",
                ]
            )
        lines.append("")
        return lines
