# Phase 1: Testing Setup - Research

**Researched:** 2026-06-10
**Domain:** React 19 & Vite testing environments (Vitest + Playwright)
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

No user constraints - all decisions at the agent's discretion.
</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Unit Testing Setup | Browser/Client | — | Runs Vitest tests inside simulated DOM (jsdom) environment for React components. |
| E2E Testing Setup | Browser/Client | API/Backend | Playwright drives real browser actions against the live running client/server instances. |
</architectural_responsibility_map>

<research_summary>
## Summary

This research focuses on installing and configuring Vitest (for unit/integration testing) and Playwright (for End-to-End testing) inside a React 19, Vite, and Tailwind CSS v4 project. 

The primary recommendation is to configure Vitest directly in the existing `vite.config.js` to ensure the bundling pipeline and CSS parsing are identical to the development setup. Playwright is configured via a dedicated `playwright.config.js` at the project root to handle E2E browser automation. Because the project uses React 19, compatible testing dependencies (specifically `@testing-library/react` v16.0.0+) must be selected to avoid peer dependency conflicts.

**Primary recommendation:** Use `vitest` with `jsdom` for React unit testing, and `@playwright/test` for E2E tests, installing with `--legacy-peer-deps` if React 19 peer mismatches arise.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vitest | ^1.6.0 | Unit test runner | Fast, natively understands Vite configs, zero-config for ES modules. |
| jsdom | ^24.0.0 | Simulated DOM environment | Standard headless browser simulation for React components testing. |
| @testing-library/react | ^16.0.0 | React component testing utilities | Recommended by the React team for rendering components and asserting hooks. |
| @playwright/test | ^1.44.0 | E2E browser automation | Fast, auto-waiting, supports parallel tests, easy headless debugging. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @testing-library/jest-dom | ^6.4.0 | Custom Jest matchers | Used in Vitest for writing expressive assertions (`toBeInTheDocument`, etc.). |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vitest | Jest | Jest requires complex Babel/Babel-jest configurations for Vite and ES modules. |
| Playwright | Cypress | Cypress runs inside the browser and is slower; Playwright has better multi-tab and multi-context support. |

**Installation:**
```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @playwright/test
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```text
traffic-master-ai/
├── src/
│   └── components/
│       └── __tests__/         # Component-specific unit tests (e.g. Card.test.jsx)
├── tests/
│   └── e2e/                   # E2E test files (e.g. auth.spec.js)
├── vite.config.js             # Updated to include vitest configuration
└── playwright.config.js       # Playwright configuration file
```

### Pattern 1: Integrated Vite & Vitest Configuration
Configure `vitest` directly in `vite.config.js` using triple-slash directives:
```javascript
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
});
```

### Anti-Patterns to Avoid
- **Re-bundling for tests**: Do not configure a separate Webpack/Babel config for Jest; use Vitest's direct Vite integration to guarantee that Tailwind v4 and JSX plugins compile exactly the same as in production.
- **Global testing tools leakage**: Ensure `globals: true` is set in Vitest configuration but setup files clean up the state after each run to prevent test cross-pollution.
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Browser Driver | Custom Selenium wrappers | Playwright | Playwright handles automatic waiting, element state verification, and speeds up headless executions. |
| DOM Assertions | Custom element check functions | `@testing-library/jest-dom` | Already handles edge cases for accessibility roles and visibility states. |
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: React 19 Peer Mismatches
- **What goes wrong:** `npm install` fails due to peer dependency mismatches with `@testing-library/react` or React DOM.
- **Why it happens:** Some older testing libraries still specify React 18 in their package.json bounds.
- **How to avoid:** Install with `--legacy-peer-deps` or explicitly select the latest versions targeting React 19.

### Pitfall 2: Missing Browser Binaries
- **What goes wrong:** Playwright tests fail with "Browser not installed" errors on execution.
- **Why it happens:** The npm package installs the runner, but not the browser binaries.
- **How to avoid:** Run `npx playwright install` immediately after package installation.
</common_pitfalls>

<code_examples>
## Code Examples

### Vitest Setup File (`src/test/setup.js`)
```javascript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extends Vitest with matchers like toBeInTheDocument
expect.extend(matchers);

// Cleanup components after each test run
afterEach(() => {
  cleanup();
});
```

### Playwright E2E Test (`tests/e2e/auth.spec.js`)
```javascript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('User can see the login page', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await expect(page.locator('h1')).toContainText('Login');
  });
});
```
</code_examples>

<sota_updates>
## State of the Art (2024-2026)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Jest | Vitest | 2023-2024 | Faster test start, native Vite alignment, less config overhead. |
| Puppeteer | Playwright | 2022+ | Standardized cross-browser testing with simpler APIs. |
</sota_updates>

<sources>
## Sources

### Primary (HIGH confidence)
- [Vitest Configuration Docs](https://vitest.dev/config/) - setup, globals, environments.
- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/) - integration with React 19.
- [Playwright Getting Started](https://playwright.dev/docs/intro) - playwright runner, global configuration.
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: Vitest & Playwright
- Ecosystem: React 19, Vite 7
- Patterns: Integrated test configs, automated browser driving

**Confidence breakdown:**
- Standard stack: HIGH - widely documented Vite patterns
- Architecture: HIGH - native integrations
- Pitfalls: HIGH - verified React 19 install patterns

**Research date:** 2026-06-10
**Valid until:** 2026-07-10
</metadata>

---
*Phase: 01-testing-setup*
*Research completed: 2026-06-10*
*Ready for planning: yes*
