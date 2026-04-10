"""Deduplicate and prioritize repeated root causes."""

from __future__ import annotations

from collections import Counter

from ..models.failure_models import FailedTestAnalysis


class DeduplicationEngine:
    """Detect repeated root cause signatures."""

    def summarize(self, analyses: list[FailedTestAnalysis]) -> list[tuple[str, int]]:
        """Return repeated cluster keys ordered by frequency."""

        counts = Counter(analysis.cluster_key for analysis in analyses)
        return counts.most_common()
