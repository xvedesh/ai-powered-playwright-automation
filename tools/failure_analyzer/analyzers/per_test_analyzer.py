"""Detailed per-test failure reasoning."""

from typing import Optional

from ..models.failure_models import FailedTestAnalysis, RecommendationBuckets, TestIdentity
from ..models.run_models import CollectedTestCase
from ..parsers.artifact_parser import ArtifactParser
from ..parsers.stacktrace_parser import StacktraceParser
from ..utils.confidence_utils import confidence_from_scores
from ..utils.text_utils import compact_lines, truncate
from .scoring_engine import ScoringEngine


class PerTestAnalyzer:
    """Analyze one failed test case."""

    OWNERSHIP_MAP = {
        "locator issue": "test automation team",
        "assertion mismatch": "unclear/shared",
        "timeout": "test automation team",
        "navigation/load issue": "infra/environment team",
        "test data issue": "test automation team",
        "environment issue": "infra/environment team",
        "network/API issue": "product/development team",
        "auth issue": "test automation team",
        "setup/fixture issue": "test automation team",
        "browser-specific issue": "test automation team",
        "framework issue": "test automation team",
        "likely product defect": "product/development team",
        "flaky test suspicion": "unclear/shared",
    }

    def __init__(self) -> None:
        self.scoring_engine = ScoringEngine()
        self.stacktrace_parser = StacktraceParser()
        self.artifact_parser = ArtifactParser()

    def analyze(self, test_case: CollectedTestCase, run_log: Optional[str] = None) -> FailedTestAnalysis:
        """Return a structured analysis for a failed test."""

        final_result = test_case.final_result
        error_message = final_result.error_message if final_result else None
        error_stack = final_result.error_stack if final_result else None
        attachment_paths = [attachment.path for attachment in (final_result.attachments if final_result else []) if attachment.path]
        error_context = self.artifact_parser.read_error_context(attachment_paths)
        combined_text = "\n".join(
            [
                text
                for text in [
                    error_message or "",
                    error_stack or "",
                    "\n".join(final_result.errors if final_result else []),
                    "\n".join(final_result.stdout if final_result else []),
                    "\n".join(final_result.stderr if final_result else []),
                    error_context or "",
                    run_log or "",
                ]
                if text
            ]
        )

        category_scores = self.scoring_engine.score(test_case, combined_text)
        sorted_categories = sorted(category_scores.items(), key=lambda item: item[1], reverse=True)
        categories = [category for category, score in sorted_categories if score > 0][:3] or ["framework issue"]
        primary_category, primary_score = sorted_categories[0]
        secondary_score = sorted_categories[1][1] if len(sorted_categories) > 1 else 0.0

        key_error_lines = self.stacktrace_parser.extract_key_lines(error_message, error_stack)
        stack_fragments = self.stacktrace_parser.extract_stack_fragments(error_stack)
        log_fragments = compact_lines((run_log or "").splitlines(), limit=6)
        artifact_references = [
            reference
            for reference in [self.artifact_parser.summarize_attachment(path) for path in attachment_paths]
            if reference is not None
        ]
        evidence_count = len(key_error_lines) + len(stack_fragments) + len(artifact_references)

        rationale = self._build_rationale(primary_category, key_error_lines, test_case)
        alternatives = self._build_alternatives(sorted_categories)
        recommendations = self._build_recommendations(primary_category)
        confidence = confidence_from_scores(primary_score, secondary_score, evidence_count)
        ownership = self.OWNERSHIP_MAP.get(primary_category, "unclear/shared")
        flaky_suspected = "flaky test suspicion" in categories or any(result.retry > 0 for result in test_case.results)
        cluster_key = self._cluster_key(primary_category, key_error_lines)

        identity = TestIdentity(
            title=test_case.title,
            file_path=test_case.file_path,
            project=test_case.project_name,
            retry_index=final_result.retry if final_result else 0,
            final_status=test_case.status,
            duration_ms=final_result.duration_ms if final_result else None,
        )
        evidence = {
            "key_error_lines": key_error_lines,
            "stack_trace_fragments": stack_fragments,
            "log_fragments": log_fragments,
            "attachment_references": artifact_references,
            "artifact_paths": attachment_paths,
            "retry_behavior": [f"retry={result.retry} status={result.status}" for result in test_case.results],
            "timestamps": [result.start_time for result in test_case.results if result.start_time],
            "error_context_excerpt": truncate(error_context, limit=700),
        }

        return FailedTestAnalysis(
            identity=identity,
            categories=categories,
            category_scores=category_scores,
            evidence=evidence,
            probable_root_cause=primary_category,
            rationale=rationale,
            alternatives=alternatives,
            recommendations=recommendations,
            confidence=confidence,
            ownership=ownership,
            flaky_suspected=flaky_suspected,
            cluster_key=cluster_key,
        )

    def _build_rationale(self, category: str, key_error_lines: list[str], test_case: CollectedTestCase) -> str:
        evidence = key_error_lines[0] if key_error_lines else "No direct error line was captured."
        return (
            f"The strongest signal points to {category} because the failure evidence is centered on "
            f"'{evidence}' and the failing execution occurred in project '{test_case.project_name}'."
        )

    def _build_alternatives(self, sorted_categories: list[tuple[str, float]]) -> list[str]:
        alternatives = [category for category, score in sorted_categories[1:3] if score > 0]
        return alternatives

    def _build_recommendations(self, category: str) -> RecommendationBuckets:
        buckets = RecommendationBuckets()
        if category == "locator issue":
            buckets.test_fix.append("Replace brittle selectors with semantic locators or stable data attributes.")
            buckets.framework_fix.append("Add a selector quality review gate for page objects with fallback locator patterns.")
        elif category == "assertion mismatch":
            buckets.test_fix.append("Revalidate the expectation against current product behavior and test data.")
            buckets.product_fix.append("Confirm whether the changed behavior is intentional or a regression.")
        elif category == "timeout":
            buckets.test_fix.append("Wait on a deterministic UI or API readiness signal instead of timing-based stability.")
            buckets.stabilization.append("Capture trace timing and consider reducing parallel contention for this flow.")
        elif category == "navigation/load issue":
            buckets.environment_fix.append("Validate site availability, redirects, and third-party resource behavior.")
            buckets.framework_fix.append("Prefer page-ready assertions over generic network idle assumptions.")
        elif category == "network/API issue":
            buckets.product_fix.append("Inspect backend availability, response codes, and data contracts around the failing endpoint.")
            buckets.environment_fix.append("Check network reachability and service health in the execution environment.")
        elif category == "auth issue":
            buckets.test_fix.append("Revalidate credentials, login flow assumptions, and storage state reuse.")
            buckets.framework_fix.append("Add dedicated auth smoke validation before dependent suites run.")
        elif category == "setup/fixture issue":
            buckets.framework_fix.append("Harden setup project and fixture dependencies because they are cascading across the suite.")
            buckets.stabilization.append("Fail fast on setup project issues and short-circuit dependent projects in CI summaries.")
        elif category == "browser-specific issue":
            buckets.test_fix.append("Compare DOM, timing, and rendering assumptions across browsers.")
            buckets.stabilization.append("Add project-scoped locator or wait tuning only after confirming true browser divergence.")
        elif category == "environment issue":
            buckets.environment_fix.append("Inspect runner health, network access, and browser process stability.")
        elif category == "likely product defect":
            buckets.product_fix.append("Escalate with captured evidence because the application behavior appears incorrect.")
        else:
            buckets.framework_fix.append("Review the test harness, fixtures, and reporter artifacts for runner-level instability.")
        return buckets

    def _cluster_key(self, primary_category: str, key_error_lines: list[str]) -> str:
        anchor = key_error_lines[0] if key_error_lines else primary_category
        anchor = anchor.lower()
        for token in ["timeout", "locator", "login", "response code", "page.goto", "storage state", "networkidle"]:
            if token in anchor:
                return f"{primary_category}:{token}"
        return f"{primary_category}:{anchor[:80]}"
