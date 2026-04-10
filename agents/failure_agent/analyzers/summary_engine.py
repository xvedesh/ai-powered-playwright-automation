"""Executive summary and priority fix generation."""

from __future__ import annotations

from collections import Counter

from ..models.failure_models import (
    AnalysisSummary,
    FailedTestAnalysis,
    FailureCluster,
    FlakySignal,
    PriorityFix,
)


class SummaryEngine:
    """Aggregate detailed analyses into executive output."""

    def summarize(
        self,
        analyses: list[FailedTestAnalysis],
        clusters: list[FailureCluster],
        flaky_signals: list[FlakySignal],
    ) -> tuple[AnalysisSummary, list[PriorityFix]]:
        """Build executive summary and ordered fix queue."""

        category_counts = Counter(category for analysis in analyses for category in analysis.categories[:1])
        project_counts = Counter(analysis.identity.project for analysis in analyses)
        ownership_counts = Counter(analysis.ownership for analysis in analyses)
        recurring_root_causes = [f"{cluster.likely_root_cause} ({len(cluster.affected_tests)} tests)" for cluster in clusters[:5]]

        priority_fixes = self._priority_fixes(clusters, flaky_signals)
        summary = AnalysisSummary(
            total_tests_analyzed=len(analyses),
            total_failed_tests=len(analyses),
            categories=dict(category_counts),
            projects=dict(project_counts),
            ownership=dict(ownership_counts),
            top_recurring_root_causes=recurring_root_causes,
            top_priority_recommendations=[fix.title for fix in priority_fixes[:5]],
            ci_summary_lines=self._ci_lines(analyses, clusters, priority_fixes),
        )
        return summary, priority_fixes

    def _priority_fixes(self, clusters: list[FailureCluster], flaky_signals: list[FlakySignal]) -> list[PriorityFix]:
        fixes: list[PriorityFix] = []
        for cluster in clusters:
            priority = "P0" if len(cluster.affected_tests) >= 5 else "P1" if len(cluster.affected_tests) >= 2 else "P2"
            ownership = "test automation team"
            if cluster.likely_root_cause in {"network/API issue", "likely product defect"}:
                ownership = "product/development team"
            elif cluster.likely_root_cause in {"environment issue", "navigation/load issue"}:
                ownership = "infra/environment team"
            fixes.append(
                PriorityFix(
                    priority=priority,
                    title=f"Resolve {cluster.likely_root_cause} cluster",
                    rationale=f"{len(cluster.affected_tests)} tests are grouped under {cluster.name}.",
                    impact="High" if priority == "P0" else "Medium",
                    ownership=ownership,
                )
            )
        if flaky_signals:
            fixes.append(
                PriorityFix(
                    priority="P2",
                    title="Stabilize flaky retry-driven tests",
                    rationale=f"{len(flaky_signals)} tests showed flaky signals across retries or timing patterns.",
                    impact="Medium",
                    ownership="unclear/shared",
                )
            )
        return fixes

    def _ci_lines(
        self,
        analyses: list[FailedTestAnalysis],
        clusters: list[FailureCluster],
        priority_fixes: list[PriorityFix],
    ) -> list[str]:
        lines = [
            f"Failed tests analyzed: {len(analyses)}",
            "Top clusters:",
        ]
        for cluster in clusters[:3]:
            lines.append(f"- {cluster.likely_root_cause}: {len(cluster.affected_tests)} tests ({cluster.confidence} confidence)")
        lines.append("Top priority fixes:")
        for fix in priority_fixes[:5]:
            lines.append(f"- {fix.priority} {fix.title} [{fix.ownership}]")
        return lines
