# AI-Powered Playwright Automation Framework

Hybrid Playwright + TypeScript automation framework designed as an enterprise-grade portfolio project. It combines UI, API, and integration testing in one scalable structure and is intentionally shaped to grow into an AI-assisted quality engineering platform for setup guidance, troubleshooting, and failure analysis.

## Overview

This framework is built around a pragmatic enterprise test architecture:

- Playwright projects separated by test type and browser
- Page object layer for UI workflows
- Service-based API layer for reusable business operations
- Shared fixtures for clean dependency injection
- Test data builders for maintainable test setup
- Storage-state based authentication setup for realistic session management
- Cross-browser ready structure with Chromium, Firefox, and WebKit support design

## Key Features

- UI, API, and integration test coverage in one repository
- Scalable TypeScript-first architecture
- Parallel-ready Playwright execution
- Cross-browser project configuration
- Service-oriented API abstraction
- Environment-driven configuration
- Enterprise-friendly folder boundaries and naming
- Extensible foundation for future AI agents

## Tech Stack

- Playwright
- TypeScript
- Node.js
- dotenv

## Project Structure

```text
.
├── src
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
│   │   └── auth
│   │       └── AuthSession.ts
│   ├── fixtures
│   │   └── test.ts
│   └── pages
│       ├── BasePage.ts
│       ├── HomePage.ts
│       └── ProductsPage.ts
├── test-data
│   └── builders
│       ├── ProductSearchBuilder.ts
│       └── UserCredentialsBuilder.ts
├── tests
│   ├── api-tests
│   ├── integration-tests
│   ├── setup
│   │   └── auth.setup.ts
│   └── ui-tests
├── playwright.config.ts
├── tsconfig.json
├── .env.example
└── README.md
```

## Installation

```bash
npm install
npx playwright install
```

Create your environment file:

```bash
cp .env.example .env
```

## Environment Configuration

`.env` supports the following values:

```env
BASE_URL=https://automationexercise.com
API_BASE_URL=https://automationexercise.com
AUTH_EMAIL=
AUTH_PASSWORD=
HEADLESS=true
```

Notes:

- `AUTH_EMAIL` and `AUTH_PASSWORD` are optional.
- If credentials are provided, the setup project will create an authenticated `storageState`.
- If credentials are omitted, the framework still creates a reusable anonymous browser state so UI projects remain consistent.

## Running Tests

Run the full suite:

```bash
npm test
```

Run by test type:

```bash
npm run test:ui
npm run test:api
npm run test:integration
```

Run by browser:

```bash
npm run test:chromium
npm run test:firefox
```

Other useful commands:

```bash
npm run test:setup
npm run test:headed
npm run test:debug
npm run test:ui-mode
npm run typecheck
npm run report
```

## Execution Model

- `setup` project creates reusable browser storage state
- `api` project runs service-level API validations
- `chromium` and `firefox` run UI tests against shared storage state
- `integration-chromium` validates API-to-UI consistency flows

This keeps the framework aligned with Playwright best practices while supporting clear separation between setup, UI, API, and integration responsibilities.

## WebKit Support

The framework is already structured for WebKit, but the `webkit` Playwright project is intentionally commented out in [playwright.config.ts](/Users/vivedesh/ai-powered-playwright-automation/playwright.config.ts).

Why it is disabled here:

- This machine is on macOS 12
- WebKit support in the current Playwright runtime requires a newer macOS environment on this setup

How to enable WebKit on a supported machine:

1. Install the browser runtime:

```bash
npx playwright install webkit
```

2. Uncomment the `webkit` project in [playwright.config.ts](/Users/vivedesh/ai-powered-playwright-automation/playwright.config.ts)

3. Run:

```bash
npm run test:webkit
```

No additional framework changes are required.

## API Layer Design

The API layer is structured around services instead of test-facing generic clients:

- `ApiClient` handles low-level request execution and response enforcement
- `ProductsService` contains reusable product-oriented operations
- `UsersService` is the entry point for user and auth-oriented flows

This pattern scales better as domains grow and keeps tests focused on business intent instead of HTTP details.

## Example Commands

```bash
npm run typecheck
npm run test:api
npm run test:ui -- --project=chromium
npm run test:integration
```

## Future AI Agents

The repository is prepared for future AI-assisted workflows such as:

- setup guidance
- failure triage
- root-cause summarization
- flaky test investigation
- self-service troubleshooting assistants

## Portfolio Positioning

This repository is intentionally built to demonstrate senior-level automation engineering principles:

- layered architecture
- reusable abstractions
- realistic auth handling
- maintainable test data patterns
- browser and project strategy for scale
- clean separation between UI, API, integration, and setup responsibilities
