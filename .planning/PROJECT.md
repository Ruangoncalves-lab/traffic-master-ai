# TrafficPro (TrafficMaster AI)

## What This Is

TrafficPro is a paid traffic management and automation SaaS dashboard. It integrates with the Meta Ads API for real-time campaign performance tracking, provides simulated analytics dashboards for Google Ads, manages customer leads through integrated CRM boards, and leverages simulated AI WhatsApp communication pipelines to boost lead conversion rates.

## Core Value

Provide unified, real-time advertising analytics dashboards and automatic background synchronizations of campaign insights to optimize marketing ROI.

## Requirements

### Validated

- ✓ Express.js REST API server with JWT authentication and multi-tenant layout filters — existing
- ✓ Supabase PostgreSQL backend integration mapped via a simulated Mongoose ORM adapter — existing
- ✓ Frontend React + Vite dashboard displaying CPC, CPM, CTR, ROAS, and campaign status charts — existing
- ✓ Meta Ads API OAuth callback exchange, token preservation, and metadata collection services — existing
- Slov ✓ Background cron scheduler executing hourly campaign updates and 15-minute anomaly detection checks — existing
- ✓ Simulated WhatsApp Chat component with automated AI responses and customer details drawer — existing

### Active

- [ ] Configure Vitest unit testing suite for core frontend pages and React context hooks
- [ ] Create Playwright E2E browser tests validation for user login, onboarding redirect, and integrations toggles
- [ ] Implement non-destructive Postgres migrations to replace table-dropping schema updates
- [ ] Refactor sessional file writing (`mockDb.js`) to support thread-safe asynchronous operations

### Out of Scope

- Native campaign publishing on non-Meta channels (Google, TikTok, LinkedIn, Twitter) — Deferred to a future milestone; currently only supported through mock UI states.

## Context

- The codebase has a dual database layer: a local mock `data.json` database used for testing and offline development, and a live Supabase configuration.
- The repository was initialized with standard JS files (ES Modules). No TypeScript configuration is currently active.

## Constraints

- **Tech Stack**: Locked into React 19, Vite, Zustand 5, Tailwind CSS v4, and Express.js.
- **Third-Party API Rate Limits**: Meta Graph API imposes strict rate limits; synchronization cron frequencies must remain regulated to avoid request blocking.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Mongoose API Simulation | Decided to write custom adapters (`supabaseAdapter.js` and `mockDb.js`) to avoid rewriting existing mongoose-based backend controllers. | ⚠️ Revisit (Lacks atomic operations in `findOneAndUpdate`, risking race conditions) |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state
---
*Last updated: 2026-06-10 after GSD initialization*
