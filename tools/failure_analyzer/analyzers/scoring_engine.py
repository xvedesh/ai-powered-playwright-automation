"""Rule-based failure scoring engine."""

from __future__ import annotations

from ..models.run_models import CollectedTestCase
from ..utils.text_utils import keyword_hits


class ScoringEngine:
    """Score likely failure categories from evidence."""

    CATEGORY_RULES = {
        "locator issue": ["locator", "waiting for", "toBeVisible", "strict mode violation", "selector", "element not found"],
        "assertion mismatch": ["expect(", "expected", "received", "to equal", "tocontaintext", "assertion"],
        "timeout": ["timeout", "timed out", "exceeded", "waitfor", "test timeout"],
        "navigation/load issue": ["page.goto", "navigation", "loadstate", "networkidle", "net::", "navigation failed"],
        "test data issue": ["already exist", "duplicate", "invalid input", "cart is empty", "not found in cart"],
        "environment issue": ["econnrefused", "enotfound", "dns", "browser has been closed", "context closed"],
        "network/API issue": ["api", "request failed", "response code", "5xx", "503", "502", "fetch", "network error"],
        "auth issue": ["login", "logged in", "unauthorized", "forbidden", "storageState", "auth"],
        "setup/fixture issue": ["setup", "fixture", "beforeall", "auth.setup", "worker fixture"],
        "browser-specific issue": ["firefox", "webkit", "chromium", "browser"],
        "framework issue": ["playwright", "test runner", "reporter", "fixture cycle", "worker process"],
        "likely product defect": ["500", "404", "unexpected application state", "server error"],
        "flaky test suspicion": ["retry", "flaky", "intermittent"],
    }

    def score(self, test_case: CollectedTestCase, combined_text: str) -> dict[str, float]:
        """Return weighted category scores."""

        lower_text = combined_text.lower()
        scores: dict[str, float] = {category: 0.0 for category in self.CATEGORY_RULES}

        for category, keywords in self.CATEGORY_RULES.items():
            scores[category] += float(keyword_hits(lower_text, keywords))

        if test_case.file_path.endswith(".setup.ts") or test_case.project_name == "setup":
            scores["setup/fixture issue"] += 4
            scores["auth issue"] += 2
        if test_case.project_name in {"firefox", "webkit", "chromium"}:
            scores["browser-specific issue"] += 1
        if test_case.status == "flaky":
            scores["flaky test suspicion"] += 5
        if any(result.retry > 0 and result.status == "passed" for result in test_case.results):
            scores["flaky test suspicion"] += 4

        if "locator" in lower_text and "timeout" in lower_text:
            scores["locator issue"] += 3
            scores["timeout"] += 2
        if "login" in lower_text and "setup" in lower_text:
            scores["auth issue"] += 3
            scores["setup/fixture issue"] += 2
        if "response code" in lower_text or "/api/" in lower_text:
            scores["network/API issue"] += 3

        return scores
