# Roadmap: TrafficPro

## Overview

Stabilize and secure the platform through standard testing frameworks (Vitest, Playwright) and robust backend database refactoring, moving from mocked simulations to thread-safe and non-destructive structures.

## Phases

- [x] **Phase 1: Testing Setup** - Configure Vitest and Playwright test runners on the project.
- [ ] **Phase 2: E2E & Unit Coverage** - Implement frontend unit tests and E2E dashboard validations.
- [ ] **Phase 3: Database Robustness** - Refactor local mocks to be thread-safe and Postgres migrations to be non-destructive.

## Phase Details

### Phase 1: Testing Setup
**Goal**: Install and configure Vitest and Playwright test runners to enable automated testing.
**Depends on**: Nothing (first phase)
**Requirements**: TEST-01, TEST-02
**Success Criteria**:
  1. Frontend test script runner `npm run test` executes successfully.
  2. Playwright test script runner `npm run test:e2e` executes successfully.
**Plans**: 2 plans

Plans:
- [x] 01-01: Install Vitest and verify test execution
- [x] 01-02: Install Playwright and verify browser test execution

### Phase 2: E2E & Unit Coverage
**Goal**: Implement comprehensive unit and E2E coverage for active routes and authentication.
**Depends on**: Phase 1
**Requirements**: TEST-03, TEST-04
**Success Criteria**:
  1. E2E browser tests successfully validate Login, Register, and Onboarding redirection flows.
  2. Unit tests validate Zustand store slices (Leads, Campaigns) and context providers.
**Plans**: 2 plans

Plans:
- [ ] 02-01: Create E2E tests for authentication and dashboard layout navigation
- [ ] 02-02: Create unit tests for Zustand store updates and utilities

### Phase 3: Database Robustness
**Goal**: Secure database state updates by eliminating destructive scripts and preventing concurrency collisions.
**Depends on**: Phase 2
**Requirements**: DB-01, DB-02
**Success Criteria**:
  1. Local mock file database transactions (`mockDb.js`) execute asynchronously with file-locking guards.
  2. SQL migration scripts in `supabase/migrations/` update tables non-destructively without using `DROP TABLE`.
**Plans**: 2 plans

Plans:
- [ ] 03-01: Implement lock safety on local file-based database operations
- [ ] 03-02: Refactor Supabase migrations to support non-destructive schema versioning

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Testing Setup | 2/2 | Complete | 2026-06-10 |
| 2. E2E & Unit Coverage | 0/2 | Not started | - |
| 3. Database Robustness | 0/2 | Not started | - |
