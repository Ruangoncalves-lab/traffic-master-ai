# Research: Phase 2 E2E & Unit Coverage

## Codebase Analysis

### E2E Testing Context
* **Current status:** The application utilizes Playwright for E2E tests.
* **Relevant files:**
  * [playwright.config.js](file:///c:/Users/Administrator/Desktop/traffic-master-ai%20%281%29/playwright.config.js)
  * [tests/e2e/auth.spec.js](file:///c:/Users/Administrator/Desktop/traffic-master-ai%20%281%29/tests/e2e/auth.spec.js)
  * [tests/e2e/navigation.spec.js](file:///c:/Users/Administrator/Desktop/traffic-master-ai%20%281%29/tests/e2e/navigation.spec.js)

### Unit Testing Context
* **Current status:** The application utilizes Vitest for frontend unit tests.
* **Relevant files:**
  * [vite.config.js](file:///c:/Users/Administrator/Desktop/traffic-master-ai%20%281%29/vite.config.js)
  * [src/store/useStore.test.js](file:///c:/Users/Administrator/Desktop/traffic-master-ai%20%281%29/src/store/useStore.test.js)
  * [server/tests/api.test.js](file:///c:/Users/Administrator/Desktop/traffic-master-ai%20%281%29/server/tests/api.test.js)

## Decisions
1. **Mocking Network Requests:** E2E tests will mock backend authentication endpoints (`**/api/auth/login`) using `page.route` to ensure unit-like isolation during execution.
2. **Local Session Seeding:** Dashboard navigation tests will inject a simulated JWT token and tenant ID directly into `window.localStorage` prior to navigation to bypass authenticating dynamically.
