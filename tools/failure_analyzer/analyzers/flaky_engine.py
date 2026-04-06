"""Flakiness signal detection."""

from typing import Optional

from ..models.failure_models import FlakySignal
from ..models.run_models import CollectedTestCase


class FlakyEngine:
    """Detect retry-driven and inconsistent execution signals."""

    def analyze(self, test_case: CollectedTestCase) -> Optional[FlakySignal]:
        """Return a flaky signal when applicable."""

        reasons: list[str] = []
        if test_case.status == "flaky":
            reasons.append("Playwright marked the test as flaky after retry recovery.")
        if any(result.retry > 0 and result.status == "passed" for result in test_case.results):
            reasons.append("A retry passed after an earlier failing attempt.")
        timeout_failures = [result for result in test_case.failing_results if "timeout" in ((result.error_message or "") + (result.error_stack or "")).lower()]
        if timeout_failures and len(test_case.results) > 1:
            reasons.append("Timeout-only behavior across retries suggests intermittent timing instability.")

        if not reasons:
            return None

        return FlakySignal(
            test_name=test_case.title,
            project=test_case.project_name,
            reasons=reasons,
            recommendation="Review synchronization, data isolation, and browser-specific timing before changing product assertions.",
        )
