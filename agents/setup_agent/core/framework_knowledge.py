from __future__ import annotations

from dataclasses import dataclass


PYTHON_SETUP_COMMAND = "npm run python:setup"
LOCAL_ANALYZE_COMMAND = "npm run test:analyze"
CI_ANALYZE_COMMAND = "npm run test:analyze:ci"
UI_COMMAND = "npm run test:ui"
API_COMMAND = "npm run test:api"
INTEGRATION_COMMAND = "npm run test:integration"
HEADED_COMMAND = "npm run test:headed -- tests/ui-tests/google.spec.ts"
RAW_HEADED_COMMAND = "npx playwright test tests/ui-tests/google.spec.ts --headed"
DEBUG_COMMAND = "npx playwright test tests/ui-tests/google.spec.ts --debug"
REPORT_COMMAND = "npm run report"
FAILURE_REPORTS = """reports/fail-analysis.status.json
reports/fail-analysis.md
reports/fail-analysis.json
artifacts/playwright-report.json
test-results/"""
ANALYZER_ONLY_COMMAND = "npm run analyzer:run"


@dataclass(frozen=True)
class FrameworkKnowledge:
    project_name: str = "AI-Powered Playwright Automation"
    description: str = "Enterprise-grade Playwright framework with AI-driven failure diagnostics"

    def summary(self) -> str:
        return "\n".join(
            [
                "Canonical framework truths:",
                f"- The recommended Python bootstrap command is: {PYTHON_SETUP_COMMAND}",
                f"- The recommended local analyzer-backed command is: {LOCAL_ANALYZE_COMMAND}",
                f"- The recommended CI analyzer-backed command is: {CI_ANALYZE_COMMAND}",
                "- The framework supports UI, API, and integration test suites with Playwright project separation.",
                "- AI diagnostics are written to reports/fail-analysis.md and reports/fail-analysis.json.",
                "- The analyzer works offline first and can optionally enrich the report with OpenAI when OPENAI_API_KEY is present.",
                "- Direct Playwright runs are supported, but they do not automatically regenerate the AI report unless the analyzer wrapper is used.",
                "- Headed and debug runs are the preferred visible execution paths when the user wants to watch the browser.",
            ]
        )


def classify_framework_intent(user_input: str) -> str | None:
    lowered = user_input.lower().strip()

    if any(phrase in lowered for phrase in [
        "setup this framework", "set up this framework", "setup framework", "help me setup", "help me set up",
        "how do i setup", "how do i set up", "how do i run this framework", "how do i run it",
    ]):
        return "SETUP_OVERVIEW"

    if any(phrase in lowered for phrase in [
        "install dependencies", "python setup", "bootstrap", "prerequisites", "first time setup",
    ]):
        return "INSTALL"

    if any(phrase in lowered for phrase in [
        "run tests", "execute tests", "run the tests", "how to run tests",
    ]):
        return "RUN_TESTS"

    if any(phrase in lowered for phrase in [
        "visible execution", "headed", "show browser", "make it visible", "watch execution", "debug run",
    ]):
        return "VISIBLE_EXECUTION"

    if any(phrase in lowered for phrase in [
        "open report", "open reports", "where are the reports", "how to open report", "how to open reports",
    ]):
        return "OPEN_REPORTS"

    if any(phrase in lowered for phrase in [
        "ai insights", "failure analyzer", "analyze failure", "rerun analyzer", "ai diagnostics",
    ]):
        return "FAILURE_ANALYZER"

    if any(phrase in lowered for phrase in [
        "troubleshoot", "troubleshooting", "why is it failing", "test failed", "playwright not working",
        "openai not working", "report not generated",
    ]):
        return "TROUBLESHOOTING"

    return None


def build_framework_guidance(intent: str) -> dict:
    if intent == "SETUP_OVERVIEW":
        return {
            "mode": "RESPOND",
            "recommendation": (
                "Use the repo's analyzer-backed Playwright flow as the default path. First bootstrap Python dependencies, then run the suite through the wrapper so failed runs automatically produce AI diagnostics."
            ),
            "reason": (
                "This framework is designed around Playwright execution plus post-run failure analysis. The wrapper commands preserve the diagnostics workflow and produce the reports documented in the repository."
            ),
            "command": (
                f"{PYTHON_SETUP_COMMAND}\n\n"
                f"{LOCAL_ANALYZE_COMMAND}"
            ),
            "what_to_expect": (
                "The Python environment will be created under .venv, Playwright will run, and if failures occur the analyzer will write fresh reports under reports/ and artifacts/."
            ),
            "fallback": "If you want raw Playwright only, use `npx playwright test`, but that path does not automatically refresh AI reports.",
            "next_question": "Do you want the broad setup flow, or commands for a specific suite like UI, API, or integration?",
        }

    if intent == "INSTALL":
        return {
            "mode": "RESPOND",
            "recommendation": "Install Node dependencies, Playwright browsers, and the Python diagnostics environment before running the framework.",
            "reason": "This repository uses both Node.js and Python. Playwright needs browser binaries, and the analyzer needs the Python environment created by the repo bootstrap script.",
            "command": "npm install\n\nnpx playwright install\n\nnpm run python:setup\n\ncp .env.example .env",
            "what_to_expect": "The project will be ready for normal execution, and OpenAI enrichment will remain optional until you set OPENAI_API_KEY in .env.",
            "fallback": "If you only want to inspect the code or run TypeScript checks, you can stop after `npm install`.",
            "next_question": "Do you want a clean first-time setup flow, or only the minimum commands to run tests now?",
        }

    if intent == "RUN_TESTS":
        return {
            "mode": "RESPOND",
            "recommendation": "Use the analyzer-backed npm scripts instead of raw Playwright so execution and diagnostics stay aligned.",
            "reason": "The wrapper commands are the supported framework flow. They write the Playwright JSON output and trigger AI failure analysis only when it is needed.",
            "command": (
                f"# Full local run\n{LOCAL_ANALYZE_COMMAND}\n\n"
                f"# UI only\n{UI_COMMAND}\n\n"
                f"# API only\n{API_COMMAND}\n\n"
                f"# Integration only\n{INTEGRATION_COMMAND}"
            ),
            "what_to_expect": "Each run executes the targeted suite, writes artifacts, and produces AI diagnostics on failure.",
            "fallback": "Use `npx playwright test <path>` for direct debugging when you do not need automatic report generation.",
            "next_question": "Do you want a full suite run, a single spec, or visible browser execution?",
        }

    if intent == "VISIBLE_EXECUTION":
        return {
            "mode": "RESPOND",
            "recommendation": "Use headed mode for visible execution, and use debug mode when you want step-through inspection with Playwright Inspector.",
            "reason": "Headed execution keeps the browser visible while preserving normal runtime behavior. Debug mode is better when you need pauses, inspector controls, or step-by-step troubleshooting.",
            "command": (
                f"# Headed framework command\n{HEADED_COMMAND}\n\n"
                f"# Raw Playwright headed run\n{RAW_HEADED_COMMAND}\n\n"
                f"# Inspector-based debug run\n{DEBUG_COMMAND}"
            ),
            "what_to_expect": "The browser will open visibly. Debug mode will pause and open Playwright Inspector for interactive troubleshooting.",
            "fallback": "If you want AI diagnostics and visible execution together, run a headed spec first and then `npm run analyzer:run` if you used raw Playwright.",
            "next_question": "Do you want the command for one specific spec file or for the full UI suite in headed mode?",
        }

    if intent == "OPEN_REPORTS":
        return {
            "mode": "RESPOND",
            "recommendation": "Use the AI report as the first stop after failures, then open the Playwright HTML report for deeper browser-level inspection.",
            "reason": "This framework is built around automated diagnostics. The Markdown report is the fastest path to root-cause hints, while the HTML report is still useful for screenshots, traces, and browser details.",
            "command": (
                f"# Open Playwright HTML report\n{REPORT_COMMAND}\n\n"
                "# Inspect AI outputs\n"
                f"{FAILURE_REPORTS}"
            ),
            "what_to_expect": "The HTML report will open in a browser, and the AI outputs under reports/ will contain structured failure analysis when failures were detected.",
            "fallback": "If the AI report is missing after a raw Playwright run, execute `npm run analyzer:run` to generate it from the existing artifacts.",
            "next_question": "Do you want me to explain which report is best for flaky UI failures versus API or setup failures?",
        }

    if intent == "FAILURE_ANALYZER":
        return {
            "mode": "RESPOND",
            "recommendation": "Use the analyzer-backed test wrapper for fresh failures, or rerun the analyzer manually when artifacts already exist.",
            "reason": "The wrapper is the normal path because it captures execution and diagnostics as one workflow. The standalone analyzer command is the right fallback when the test run already happened.",
            "command": (
                f"# Run Playwright with AI diagnostics\n{LOCAL_ANALYZE_COMMAND}\n\n"
                f"# CI-style analysis\n{CI_ANALYZE_COMMAND}\n\n"
                f"# Analyze an existing failed run\n{ANALYZER_ONLY_COMMAND}"
            ),
            "what_to_expect": "The analyzer will produce `reports/fail-analysis.md`, `reports/fail-analysis.json`, and a status file describing analysis progress or completion.",
            "fallback": "If OpenAI is unavailable, the offline analyzer still produces the reports.",
            "next_question": "Do you want the normal analyzer flow, or help interpreting a report that already exists?",
        }

    if intent == "TROUBLESHOOTING":
        return {
            "mode": "RESPOND",
            "recommendation": "Start by separating environment issues from test failures: verify install prerequisites, then confirm whether the run used the analyzer-backed path, then inspect the AI status and report files.",
            "reason": "Most issues in this framework fall into one of three buckets: missing local dependencies, direct Playwright execution without analyzer regeneration, or a real test/application failure already explained by the generated reports.",
            "command": (
                "npm install\n\n"
                "npx playwright install\n\n"
                "npm run python:setup\n\n"
                "npm run test:analyze"
            ),
            "what_to_expect": "If the environment is healthy, the run will either pass cleanly or produce actionable diagnostics under reports/ and artifacts/.",
            "fallback": "If you already have a failed run and only need the diagnostic report, use `npm run analyzer:run` instead of rerunning the full suite.",
            "next_question": "Is your issue about setup, visible execution, or a failed report/analyzer run?",
        }

    return {
        "mode": "RESPOND",
        "recommendation": "Use the README and the analyzer-backed scripts as the canonical framework flow.",
        "reason": "This repository has a specific execution and diagnostics model that is better than generic Playwright advice.",
        "command": "N/A",
        "what_to_expect": "N/A",
        "fallback": "N/A",
        "next_question": "N/A",
    }
