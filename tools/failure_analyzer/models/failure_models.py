"""Analysis result models."""

from dataclasses import dataclass, field
from typing import Any, Optional


@dataclass
class TestIdentity:
    """Identity fields for one failed test."""

    title: str
    file_path: str
    project: str
    retry_index: int
    final_status: str
    duration_ms: Optional[int]


@dataclass
class RecommendationBuckets:
    """Actionable recommendation buckets."""

    test_fix: list[str] = field(default_factory=list)
    framework_fix: list[str] = field(default_factory=list)
    environment_fix: list[str] = field(default_factory=list)
    product_fix: list[str] = field(default_factory=list)
    stabilization: list[str] = field(default_factory=list)


@dataclass
class FailedTestAnalysis:
    """Detailed per-test analysis output."""

    identity: TestIdentity
    categories: list[str]
    category_scores: dict[str, float]
    evidence: dict[str, Any]
    probable_root_cause: str
    rationale: str
    alternatives: list[str]
    recommendations: RecommendationBuckets
    confidence: str
    ownership: str
    flaky_suspected: bool
    cluster_key: str


@dataclass
class FailureCluster:
    """Shared root cause cluster."""

    name: str
    likely_root_cause: str
    affected_tests: list[str]
    confidence: str
    recommended_next_action: str
    categories: list[str] = field(default_factory=list)


@dataclass
class FlakySignal:
    """Potential flaky test signal."""

    test_name: str
    project: str
    reasons: list[str]
    recommendation: str


@dataclass
class PriorityFix:
    """Ordered fix suggestion."""

    priority: str
    title: str
    rationale: str
    impact: str
    ownership: str


@dataclass
class AnalysisSummary:
    """Executive summary metrics and aggregations."""

    total_tests_analyzed: int
    total_failed_tests: int
    categories: dict[str, int]
    projects: dict[str, int]
    ownership: dict[str, int]
    top_recurring_root_causes: list[str]
    top_priority_recommendations: list[str]
    ci_summary_lines: list[str] = field(default_factory=list)


@dataclass
class AIEnhancedSummary:
    """Optional LLM-enhanced narrative layer."""

    provider: str
    model: str
    enabled: bool
    executive_summary: str
    grouped_patterns: list[str]
    priority_recommendations: list[str]
    ci_summary: list[str]
    status: str
    error: Optional[str] = None


@dataclass
class AnalysisReport:
    """Complete analyzer output."""

    run_metadata: dict[str, Any]
    summary: AnalysisSummary
    failed_tests: list[FailedTestAnalysis]
    clusters: list[FailureCluster]
    flaky_signals: list[FlakySignal]
    priority_fixes: list[PriorityFix]
    ai_summary: Optional[AIEnhancedSummary] = None
