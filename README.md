# AI-Powered Playwright Automation Framework

Enterprise-style Playwright + TypeScript automation framework for UI, API, and integration testing, designed as a portfolio-grade hybrid quality engineering platform. The framework is built to be practical first: scalable structure, clean test architecture, anti-flakiness protections, and a Python-based AI failure analysis layer that turns failed runs into actionable diagnostics.

## Project Overview

This repository is built around a modern automation architecture:

- Playwright multi-project execution for setup, UI, API, and integration flows
- TypeScript-first page objects, fixtures, and service abstractions
- Reusable builders for test data creation
- Storage-state based auth setup for realistic browser sessions
- Global anti-flakiness protections against ad overlays and intrusive popups
- Python-based failure analyzer agent with Markdown and JSON reports
- Clean extension points for future AI setup, troubleshooting, and diagnostics agents

The current framework targets Automation Exercise as a practice system, but the architecture is intentionally reusable and enterprise-oriented.

## Architecture Review Summary

Current strengths:

- Clear separation between `tests`, `pages`, `api`, `fixtures`, `config`, and `tools`
- Service-based API layer instead of tests calling raw HTTP directly
- Shared fixture composition for dependency injection and clean test signatures
- Builders for domain test data instead of inline hardcoded payloads
- Dedicated setup project for auth/session preparation
- Analyzer pipeline isolated from Playwright-specific parsing so it can evolve later for other frameworks

Key hardening already added:

- Ad/network blocking at the browser layer
- Auto-dismiss handling for common ad/interstitial overlays
- User-centric locator strategy in primary page objects
- `test.step(...)` usage across core UI, API, and integration flows
- Descriptive assertion messages for easier CI diagnosis
- Failure analysis wrapper with predictable report output
- Optional OpenAI enrichment layered on top of an offline rule-based analyzer

Current practical guidance:

- Prefer `npm run test:*` wrapper scripts over raw `playwright test`
- Use generated analyzer reports as the source of truth after failures
- Treat `test:raw`, `test:debug`, and `test:ui-mode` as direct Playwright runs that do not automatically refresh AI analysis

## Key Features

- UI, API, and integration coverage in one repository
- Chromium and Firefox execution with WebKit-ready structure
- Parallel Playwright execution with configurable worker scaling
- Enterprise-style page object model and service layer
- Global anti-flakiness protections for ads and overlays
- Auth setup with reusable `storageState`
- Reusable test data builders
- AI-ready failure diagnostics with offline fallback
- OpenAI-enhanced summary layer when configured
- Predictable report and artifact paths for local and CI usage

## Tech Stack

- Playwright
- TypeScript
- Node.js
- Python
- OpenAI Python SDK
- dotenv

## Project Structure

```text
.
├── src
│   ├── agents
│   ├── api
│   │   ├── core
│   │   │   └── ApiClient.ts
│   │   ├── models
│   │   │   ├── Product.ts
│   │   │   └── User.ts
│   │   └── services
│   │       ├── ProductsService.ts
│   │       └── UsersService.ts
│   ├── config
│   │   ├── env.ts
│   │   └── paths.ts
│   ├── core
│   │   ├── auth
│   │   │   └── AuthSession.ts
│   │   ├── browser
│   │   │   └── AdGuard.ts
│   │   └── workflows
│   │       └── AutomationExerciseFlows.ts
│   ├── fixtures
│   │   └── test.ts
│   ├── models
│   │   ├── ContactMessage.ts
│   │   ├── PaymentDetails.ts
│   │   ├── ProductReview.ts
│   │   └── UserRegistration.ts
│   └── pages
│       ├── BasePage.ts
│       ├── AccountCreatedPage.ts
│       ├── AccountDeletedPage.ts
│       ├── CartPage.ts
│       ├── CheckoutPage.ts
│       ├── ContactUsPage.ts
│       ├── EnterAccountInformationPage.ts
│       ├── HomePage.ts
│       ├── LoggedHomePage.ts
│       ├── LoginSignupPage.ts
│       ├── PaymentPage.ts
│       ├── ProductDetailPage.ts
│       ├── ProductsPage.ts
│       └── TestCasesPage.ts
├── test-data
│   ├── builders
│   │   ├── ContactMessageBuilder.ts
│   │   ├── PaymentDetailsBuilder.ts
│   │   ├── ProductReviewBuilder.ts
│   │   ├── ProductSearchBuilder.ts
│   │   ├── UserCredentialsBuilder.ts
│   │   └── UserRegistrationBuilder.ts
│   └── files
│       └── contact-upload.txt
├── tests
│   ├── api-tests
│   ├── integration-tests
│   ├── setup
│   │   └── auth.setup.ts
│   └── ui-tests
├── tools
│   ├── failure_analyzer
│   │   ├── analyzers
│   │   ├── collectors
│   │   ├── models
│   │   ├── parsers
│   │   ├── reporters
│   │   └── utils
│   ├── failure_analyzer_smoke_test.py
│   └── run_playwright_with_analysis.py
├── artifacts
├── reports
├── playwright.config.ts
├── requirements.txt
├── tsconfig.json
├── .env.example
└── README.md
```

## Installation

Install Node and Playwright dependencies:

```bash
npm install
npx playwright install
```

Create the local Python environment for the analyzer:

```bash
npm run python:setup
```

Create your environment file:

```bash
cp .env.example .env
```

## Environment Configuration

Recommended `.env` shape:

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

Notes:

- `AUTH_EMAIL` and `AUTH_PASSWORD` are optional
- when auth credentials are present, setup creates authenticated browser state
- when auth credentials are absent, setup still creates a reusable baseline state
- `OPENAI_API_KEY` is optional
- the failure analyzer works without OpenAI
- OpenAI is used only as a summary/enrichment layer on top of the offline analyzer

## Running Tests

Recommended commands:

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
npm run python:setup
npm run analyzer:test
npm run analyzer:run
npm run test:setup
npm run typecheck
npm run report
```

Run with a fixed worker count:

```bash
PLAYWRIGHT_WORKERS=4 npm run test:ui
PLAYWRIGHT_WORKERS=4 npm run test:analyze
```

Run with percentage-based workers:

```bash
PLAYWRIGHT_WORKERS=75% npm run test:ui
```

## Important Execution Behavior

The framework has two run modes in practice:

Analyzer-backed runs:

- `npm test`
- `npm run test:ui`
- `npm run test:api`
- `npm run test:integration`
- `npm run test:chromium`
- `npm run test:firefox`
- `npm run test:analyze`
- `npm run test:analyze:ci`

These commands:

1. run Playwright
2. write Playwright JSON output
3. if failures exist, trigger the Python analyzer
4. write AI failure reports

Direct Playwright runs:

- `npm run test:raw`
- `npm run test:debug`
- `npm run test:ui-mode`
- direct `npx playwright test ...`

These commands do not automatically regenerate the AI analysis report.

If you use a direct Playwright run and want the report afterward, run:

```bash
npm run analyzer:run
```

## Playwright Projects

Current project model:

- `setup`
  - prepares reusable `storageState`
- `api`
  - API/service-level validations
- `chromium`
  - UI suite in Chrome
- `firefox`
  - UI suite in Firefox
- `integration-chromium`
  - integration flows using shared auth state

This keeps setup, UI, API, and integration responsibilities separated in a way that scales well.

## Anti-Flakiness Strategy

The framework now includes explicit protections against the biggest sources of unstable UI automation on public practice sites.

### 1. Ad Blocking

Global request blocking is applied through [AdGuard.ts](/Users/vivedesh/ai-powered-playwright-automation/src/core/browser/AdGuard.ts) and installed via the shared fixture in [test.ts](/Users/vivedesh/ai-powered-playwright-automation/src/fixtures/test.ts).

Blocked domains include patterns such as:

- `googleads`
- `doubleclick`
- `google-analytics`
- `facebook.net`

This reduces noise from ads, tracking scripts, and interstitial injection points.

### 2. Overlay Auto-Dismiss

The shared browser fixture also registers global locator handlers that best-effort dismiss common popups and interstitial controls like:

- `Close`
- `Dismiss`
- `X`
- `×`

This is especially useful on public automation practice sites that inject modal interruptions.

### 3. URL Recovery

Shared navigation helpers in [BasePage.ts](/Users/vivedesh/ai-powered-playwright-automation/src/pages/BasePage.ts) include recovery for external fragment noise such as `#google_vignette`, so tests can return to intended routes instead of failing on irrelevant ad behavior.

## Locator Strategy

The framework has been refactored toward Playwright’s preferred locator hierarchy:

- `getByRole()` for buttons, links, headings, and controls
- `getByLabel()` and `getByPlaceholder()` for form inputs
- `getByText()` for static content validation
- `getByAltText()` for images and identity markers
- `getByTestId()` only as a fallback when semantic locators are not enough
- stable CSS/id locators only when the application DOM requires them

The goal is to keep selectors readable, resilient, and tied to user intent rather than brittle page structure.

## Readability Standards

Core test suites were refactored to use:

- `await test.step('Business-oriented description', async () => { ... })`
- descriptive page object method names
- custom assertion messages for CI and failure analysis clarity

This makes tests easier to debug and easier to read as business workflows rather than low-level UI scripts.

## API Layer Design

The API layer is service-based instead of exposing raw generic clients directly to tests.

Key pieces:

- [ApiClient.ts](/Users/vivedesh/ai-powered-playwright-automation/src/api/core/ApiClient.ts)
- [ProductsService.ts](/Users/vivedesh/ai-powered-playwright-automation/src/api/services/ProductsService.ts)
- [UsersService.ts](/Users/vivedesh/ai-powered-playwright-automation/src/api/services/UsersService.ts)

This keeps tests focused on business intent and makes the HTTP plumbing reusable and easier to evolve.

## Authentication Strategy

Auth is handled through a dedicated setup project and reusable storage state:

- setup test: [auth.setup.ts](/Users/vivedesh/ai-powered-playwright-automation/tests/setup/auth.setup.ts)
- session logic: [AuthSession.ts](/Users/vivedesh/ai-powered-playwright-automation/src/core/auth/AuthSession.ts)

Behavior:

- with credentials: authenticated state is created
- without credentials: a stable anonymous baseline state is created

This keeps UI tests realistic and aligned with Playwright best practices.

## Failure Analyzer Agent

The framework includes a Python-based failure analyzer designed to behave like a practical Senior SDET diagnostic assistant, not just a raw log parser.

### What It Does

- runs detailed post-processing only when failures exist
- parses Playwright JSON results
- scans `test-results` artifacts
- reads captured execution logs
- analyzes each failed test individually
- groups failures into shared clusters
- suggests likely ownership and root cause
- produces a Markdown report and a JSON report
- optionally asks OpenAI for a higher-level summary layer

### Analyzer Inputs

The analyzer uses as many of these as are available:

- `artifacts/playwright-report.json`
- `artifacts/playwright-run.log`
- `test-results/`
- stack traces
- assertion errors
- timeout failures
- locator failures
- setup/auth/fixture failures
- screenshots, videos, and error-context files

### Analyzer Outputs

Primary reports:

- [fail-analysis.md](/Users/vivedesh/ai-powered-playwright-automation/reports/fail-analysis.md)
- [fail-analysis.json](/Users/vivedesh/ai-powered-playwright-automation/reports/fail-analysis.json)

Status tracking:

- [fail-analysis.status.json](/Users/vivedesh/ai-powered-playwright-automation/reports/fail-analysis.status.json)

Supporting artifacts:

- [playwright-report.json](/Users/vivedesh/ai-powered-playwright-automation/artifacts/playwright-report.json)
- [playwright-run.log](/Users/vivedesh/ai-powered-playwright-automation/artifacts/playwright-run.log)

### Where To Look After a Failed Run

If a run fails, check in this order:

1. [fail-analysis.status.json](/Users/vivedesh/ai-powered-playwright-automation/reports/fail-analysis.status.json)
2. [fail-analysis.md](/Users/vivedesh/ai-powered-playwright-automation/reports/fail-analysis.md)
3. [fail-analysis.json](/Users/vivedesh/ai-powered-playwright-automation/reports/fail-analysis.json)
4. [playwright-report.json](/Users/vivedesh/ai-powered-playwright-automation/artifacts/playwright-report.json)
5. `test-results/<failed-test-folder>/`

### Status File Semantics

The status file helps explain whether the report is still being prepared.

Stages:

- `running_tests`
  - Playwright execution is still running
- `analyzing`
  - Playwright has finished and the analyzer is building reports
- `completed`
  - reports have been written successfully
- `failed`
  - analyzer itself did not finish successfully

### OpenAI Behavior

OpenAI is optional.

If configured:

- the analyzer still performs its full offline rule-based reasoning first
- OpenAI is used only to enrich the narrative summary
- if OpenAI is unavailable, reports are still generated

Important:

- OpenAI connectivity checks no longer block test startup
- tests run first
- OpenAI summary is attempted only during failure analysis

### Manual Analyzer Usage

Run Playwright with analysis:

```bash
npm run test:analyze
```

Run CI-style analysis:

```bash
npm run test:analyze:ci
```

Generate analysis from an existing failed artifact set:

```bash
npm run analyzer:run
```

Run analyzer directly:

```bash
./.venv/bin/python -m tools.failure_analyzer \
  --playwright-report artifacts/playwright-report.json \
  --test-results test-results \
  --output-md reports/fail-analysis.md \
  --output-json reports/fail-analysis.json \
  --mode local \
  --log-file artifacts/playwright-run.log
```

### Analyzer Architecture

The Python analyzer is modular and intentionally extensible:

- collectors
  - gather reports, logs, and artifacts
- parsers
  - turn Playwright-specific outputs into normalized models
- analyzers
  - classify failures, score likely causes, detect flakiness, and cluster related failures
- reporters
  - write Markdown and JSON output

This keeps Playwright-specific parsing isolated so future adapters for pytest, Selenium, or Cypress can be added cleanly.

## WebKit Support

The framework is ready for WebKit, but the project remains commented out in [playwright.config.ts](/Users/vivedesh/ai-powered-playwright-automation/playwright.config.ts) on this machine.

Why:

- this machine is on macOS 12
- the installed Playwright WebKit runtime requires a newer environment here

How to enable on a supported machine:

1. Install WebKit:

```bash
npx playwright install webkit
```

2. Uncomment the `webkit` project in [playwright.config.ts](/Users/vivedesh/ai-powered-playwright-automation/playwright.config.ts)

3. Run:

```bash
npm run test:webkit
```

## Recommended Daily Workflow

For normal development:

```bash
npm run typecheck
PLAYWRIGHT_WORKERS=4 npm run test:ui
```

For full failure analysis:

```bash
PLAYWRIGHT_WORKERS=4 npm run test:analyze
```

If the suite was run directly without the wrapper:

```bash
npm run analyzer:run
```

## Future AI Direction

The repository is intentionally structured to grow into a broader AI-assisted quality engineering platform. Natural next additions include:

- setup and onboarding agents
- flaky-test triage agents
- locator repair suggestions
- CI comment publishing for failure summaries
- historical run comparison and trend-based clustering

## Notes

- the analyzer wrapper is the recommended execution path
- the HTML Playwright report is configured with `open: 'never'` so runs can complete cleanly and hand off to the analyzer
- analyzer output is synchronous: once the wrapper command finishes, the report should already exist
- if the report does not look fresh, check the status file first
