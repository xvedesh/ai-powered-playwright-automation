"""Shared failure clustering."""

from __future__ import annotations

from collections import defaultdict

from ..models.failure_models import FailedTestAnalysis, FailureCluster


class ClusteringEngine:
    """Group failed tests by likely shared root cause."""

    def cluster(self, analyses: list[FailedTestAnalysis]) -> list[FailureCluster]:
        """Build shared failure clusters."""

        grouped: dict[str, list[FailedTestAnalysis]] = defaultdict(list)
        for analysis in analyses:
            grouped[analysis.cluster_key].append(analysis)

        clusters: list[FailureCluster] = []
        for cluster_key, cluster_analyses in sorted(grouped.items(), key=lambda item: len(item[1]), reverse=True):
            primary = cluster_analyses[0]
            confidence = self._cluster_confidence(cluster_analyses)
            clusters.append(
                FailureCluster(
                    name=cluster_key,
                    likely_root_cause=primary.probable_root_cause,
                    affected_tests=[analysis.identity.title for analysis in cluster_analyses],
                    confidence=confidence,
                    recommended_next_action=self._next_action(primary.probable_root_cause),
                    categories=sorted({category for analysis in cluster_analyses for category in analysis.categories}),
                )
            )
        return clusters

    def _cluster_confidence(self, analyses: list[FailedTestAnalysis]) -> str:
        if len(analyses) >= 4 and all(analysis.confidence in {"high", "medium"} for analysis in analyses):
            return "high"
        if len(analyses) >= 2:
            return "medium"
        return analyses[0].confidence

    def _next_action(self, root_cause: str) -> str:
        if root_cause in {"auth issue", "setup/fixture issue"}:
            return "Stabilize the shared setup path first because it can unblock multiple dependent failures."
        if root_cause in {"locator issue", "browser-specific issue"}:
            return "Review the affected page object selectors and compare browser-specific DOM behavior."
        if root_cause in {"environment issue", "navigation/load issue", "network/API issue"}:
            return "Validate environment and service health before changing test assertions."
        return "Start with the highest-signal failing test in the cluster and validate whether the behavior is product or test drift."
