# AI-Powered Playwright Automation Framework

![Playwright](https://img.shields.io/badge/Playwright-E2E%20Automation-2EAD33?style=for-the-badge&logo=playwright)
![TypeScript](https://img.shields.io/badge/TypeScript-Strongly%20Typed-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![AI Diagnostics](https://img.shields.io/badge/AI-Automated%20Diagnostics-111827?style=for-the-badge)
![Enterprise Ready](https://img.shields.io/badge/Enterprise-Scalable%20by%20Design-0F766E?style=for-the-badge)

Enterprise-grade Playwright + TypeScript automation framework for UI, API, and integration testing. It is designed for modern quality engineering teams that need reliable execution, actionable diagnostics, and an architecture that can scale from local development to CI pipelines with self-healing-ready foundations.

## Value Proposition

This framework is built to do more than execute tests. It is designed to shorten debugging cycles, reduce operational noise, and improve delivery confidence through automated diagnostics and durable test architecture.

What makes it different:

- Automated Diagnostics that convert failed runs into structured root-cause analysis
- Reduced MTTR through AI-assisted failure triage and ownership-oriented reporting
- Enterprise Scalability through clean separation of UI, API, setup, fixtures, services, and diagnostics
- Self-healing-ready design with stable locator patterns, reusable workflows, and modular analyzer components
- Reliability-focused execution with infrastructure-level protections against flaky browser behavior

## AI-Powered Diagnostics

The AI Failure Analyzer is the primary differentiator of this framework. Instead of leaving teams with raw stack traces and scattered artifacts, failed runs are transformed into a clear diagnostic report that helps engineers move from symptom to likely cause faster.

### Why It Matters

- Reduces MTTR by generating automated root-cause analysis immediately after failed runs
- Correlates Playwright JSON output, logs, stack traces, and test artifacts
- Detects repeated patterns and clusters related failures
- Produces both human-readable Markdown and machine-consumable JSON outputs
- Works offline by default, with optional OpenAI enrichment for higher-quality narrative summaries

### How to Use AI Insights

Trigger analysis:

```bash
npm run test:analyze
```

Primary report location:

```text
reports/fail-analysis.md
```

How it works:

- Offline Rule-based analysis runs first and performs the core reasoning
- Optional OpenAI enrichment adds a higher-level summary when `OPENAI_API_KEY` is configured
- If OpenAI is unavailable, the analyzer still produces local reports without blocking execution

### Diagnostic Inputs

The analyzer evaluates available execution evidence, including:

- `artifacts/playwright-report.json`
- `artifacts/playwright-run.log`
- `test-results/`
- stack traces and assertion failures
- timeouts, locator failures, and setup failures
- screenshots, videos, and related error artifacts

### Diagnostic Outputs

Primary outputs:

- `reports/fail-analysis.md`
- `reports/fail-analysis.json`
- `reports/fail-analysis.status.json`

Supporting execution artifacts:

- `artifacts/playwright-report.json`
- `artifacts/playwright-run.log`

## Architecture & Tech Stack

The framework follows an enterprise testing architecture that separates concerns cleanly and supports long-term maintainability.

### Architecture Highlights

- `tests/` contains setup, UI, API, and integration suites with clear execution boundaries
- `src/pages/` implements page objects aligned to business workflows
- `src/api/` provides service abstractions so tests validate behavior, not raw HTTP plumbing
- `src/fixtures/` centralizes shared browser and dependency injection behavior
- `src/core/` contains cross-cutting capabilities such as auth state and browser protections
- `tools/failure_analyzer/` isolates the diagnostics engine into collectors, parsers, analyzers, and reporters

### Tech Stack

- Playwright
- TypeScript
- Node.js
- Python
- OpenAI Python SDK
- dotenv

### Execution Model

Current Playwright project separation:

- `setup` for reusable authentication and browser state preparation
- `api` for service-level and contract-oriented validation
- `chromium` for UI coverage in Chrome
- `firefox` for UI coverage in Firefox
- `integration-chromium` for authenticated end-to-end integration flows

This model supports predictable scaling across local execution and CI while keeping setup, browser, and API responsibilities intentionally decoupled.

## Getting Started

### Prerequisites

- Node.js
- Python 3
- Playwright browser dependencies

### Installation

Install Node.js dependencies:

```bash
npm install
```

Install Playwright browsers:

```bash
npx playwright install
```

Create the local Python environment for diagnostics:

```bash
npm run python:setup
```

Create your environment file:

```bash
cp .env.example .env
```

### Recommended Environment Configuration

```env
BASE_URL=https://automationexercise.com
API_BASE_URL=https://automationexercise.com
AUTH_EMAIL=
AUTH_PASSWORD=
HEADLESS=true

OPENAI_API_KEY=
FAILURE_ANALYZER_USE_OPENAI=true
FAILURE_ANALYZER_OPENAI_MODEL=gpt-5.4
FAILURE_ANALYZER_OPENAI_TIMEOUT_SECONDS=45
FAILURE_ANALYZER_OPENAI_BASE_URL=https://api.openai.com/v1/responses
```

Environment behavior:

- `AUTH_EMAIL` and `AUTH_PASSWORD` are optional
- authenticated browser state is created when credentials are present
- a stable anonymous baseline state is created when credentials are absent
- OpenAI enrichment is optional and never replaces the offline analyzer

### Recommended Commands

```bash
npm test
npm run test:ui
npm run test:api
npm run test:integration
npm run test:chromium
npm run test:firefox
npm run test:analyze
npm run test:analyze:ci
```

Useful supporting commands:

```bash
npm run test:setup
npm run test:headed
npm run test:debug
npm run test:ui-mode
npm run analyzer:run
npm run analyzer:test
npm run typecheck
npm run report
```

Worker scaling examples:

```bash
PLAYWRIGHT_WORKERS=4 npm run test:ui
PLAYWRIGHT_WORKERS=4 npm run test:analyze
PLAYWRIGHT_WORKERS=75% npm run test:ui
```

### Project Structure

```text
<project-root>/
├── src/
│   ├── api/
│   ├── config/
│   ├── core/
│   ├── fixtures/
│   ├── models/
│   └── pages/
├── test-data/
├── tests/
│   ├── api-tests/
│   ├── integration-tests/
│   ├── setup/
│   └── ui-tests/
├── tools/
│   ├── failure_analyzer/
│   ├── failure_analyzer_smoke_test.py
│   └── run_playwright_with_analysis.py
├── artifacts/
├── reports/
├── playwright.config.ts
├── requirements.txt
└── README.md
```

## Anti-Flakiness & Reliability

Reliability in this framework is treated as an architectural concern, not a collection of isolated fixes. The design aims to create stable, repeatable execution in noisy real-world environments and provide a foundation for self-healing-ready automation.

### Reliability Architecture

The framework embeds anti-flakiness controls into shared infrastructure so every suite benefits consistently:

- Request-level ad and tracker suppression reduces interference from third-party scripts and injected overlays
- Shared overlay auto-dismiss behavior neutralizes common modal interruptions before they destabilize user flows
- Navigation recovery logic protects journeys from external URL fragment pollution such as `#google_vignette`
- Storage-state based authentication minimizes repeated setup steps and reduces session instability
- Standardized `test.step(...)` usage improves observability and diagnostics quality in local and CI execution

### Locator Strategy as an Architectural Standard

Selector design is treated as a maintainability decision aligned to user intent and long-term resilience:

- `getByRole()` for controls and navigational elements
- `getByLabel()` and `getByPlaceholder()` for form interactions
- `getByText()` for business-content validation
- `getByAltText()` for visual identity elements
- `getByTestId()` only when semantic locators are insufficient
- CSS or ID selectors only when the application DOM requires a lower-level fallback

This strategy improves readability, reduces brittleness, and supports future self-healing and automated locator diagnostics.

## CI/CD Integration

The framework is designed for CI-first execution, artifact traceability, and fast diagnostic handoff.

### CI Execution Model

- Analyzer-backed commands generate structured failure reports as part of the execution flow
- JSON reporting enables downstream processing, dashboards, and future automated remediation workflows
- Status tracking through `reports/fail-analysis.status.json` makes analyzer progress explicit
- HTML report generation is configured with `open: 'never'` for non-interactive pipeline stability
- Retry, trace, screenshot, and video policies are already tuned for practical CI diagnosis

### Recommended Pipeline Commands

```bash
npm run typecheck
npm run test:analyze:ci
```

### Report Consumption Order After Failure

When a CI run fails, inspect artifacts in this order:

1. `reports/fail-analysis.status.json`
2. `reports/fail-analysis.md`
3. `reports/fail-analysis.json`
4. `artifacts/playwright-report.json`
5. `test-results/`

## Enterprise Outlook

The current architecture is intentionally positioned to evolve beyond test execution into a broader AI-assisted quality engineering platform.

Planned extension areas include:

- flaky-test triage agents
- locator repair suggestions
- CI comment publishing for failure summaries
- historical run comparison and failure clustering
- onboarding and troubleshooting assistants for test operators
