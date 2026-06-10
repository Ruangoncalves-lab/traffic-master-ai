# Testing patterns

This document records the testing methodologies, structure, scripting, and coverage requirements.

*Last Updated: 2026-06-10*

## 1. Testing Frameworks & Configuration

Currently, the project does not rely on an automated testing framework (such as Jest, Vitest, Mocha, Cypress, or Playwright).
- There are no test runners configured in either frontend or backend configurations.
- No testing runners exist in `package.json` devDependencies.

## 2. Verification Scripts

Validation is performed using manual assertion scripts located throughout the repository. These verify database structures, credentials hashing, connection clients, and endpoint responses.

Key verification scripts:
- **Auth Endpoint Test**: [test-login.js](file:///c:/Users/Administrator/Desktop/traffic-master-ai%20(1)/test-login.js) targets `POST /api/auth/login` locally to ensure user credentials resolve correctly and retrieve token hashes.
- **Backend Model Verification**: [server/test-models.js](file:///c:/Users/Administrator/Desktop/traffic-master-ai%20(1)/server/test-models.js) prints class objects to verify the loading of DB adapters.
- **Meta Ads SDK Test**: [server/test-meta-sdk.js](file:///c:/Users/Administrator/Desktop/traffic-master-ai%20(1)/server/test-meta-sdk.js) validates SDK calls to verify token exchanges.
- **Connection Checks**: [server/check-connection.js](file:///c:/Users/Administrator/Desktop/traffic-master-ai%20(1)/server/check-connection.js) checks database connection setups.
- **Metrics Checking**: [server/verify_metrics.js](file:///c:/Users/Administrator/Desktop/traffic-master-ai%20(1)/server/verify_metrics.js) confirms the parsing and saving of telemetry variables.

## 3. Recommended Future Pipeline

To scale the application reliably, the following changes are recommended:
1. **Unit Testing**: Configure Vitest for frontend components and Jest/Supertest for Express controller routers.
2. **End-to-End Testing**: Set up Playwright to test onboarding pages, credentials verification, dashboard rendering, and integrations status toggles.
3. **CI/CD Integration**: Automatically run test commands on PR merges.
