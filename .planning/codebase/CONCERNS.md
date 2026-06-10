# Codebase Concerns

This document details identified technical debt, bugs, security vulnerabilities, performance limits, and fragile components.

*Last Updated: 2026-06-10*

## 1. High Tech Debt: Custom ORM Adapters

- **Mongoose-to-Supabase Translation**: The server maps Mongoose calls (`find`, `findOne`, `findOneAndUpdate`, `save`) into Supabase PostgREST clients via [server/models/supabaseAdapter.js](file:///c:/Users/Administrator/Desktop/traffic-master-ai%20(1)/server/models/supabaseAdapter.js).
  - This is fragile and simulates complex Mongoose query structures.
  - Updates via `findOneAndUpdate` are simulated sequentially: first checking if a record exists using a separate query, then inserting/updating. This pattern is not atomic and is vulnerable to race conditions.
- **Concurrent Disk Writes in Mock DB**: The local backend fallback [server/models/mockDb.js](file:///c:/Users/Administrator/Desktop/traffic-master-ai%20(1)/server/models/mockDb.js) reads and writes a single `server/data.json` file synchronously (`readFileSync`/`writeFileSync`).
  - This is not thread-safe.
  - Under concurrent user access or background cron schedules, data will be lost or corrupted.

## 2. Security Vulnerabilities

- **Destructive Migration Scripts**: Supabase migration SQL scripts (e.g. [20251205_meta_integration_v2.sql](file:///c:/Users/Administrator/Desktop/traffic-master-ai%20(1)/supabase/migrations/20251205_meta_integration_v2.sql)) begin with `DROP TABLE IF EXISTS` statements.
  - Applying updates to the database drops existing production tables and deletes user tokens, configurations, and campaigns.
- **Plaintext Secrets and Warnings**: In [src/lib/supabase.js](file:///c:/Users/Administrator/Desktop/traffic-master-ai%20(1)/src/lib/supabase.js) and other entry points, warnings are printed to the client console if credentials are missing or invalid, exposing internal configurations.

## 3. Reliability & Integration Fragility

- **Rate Limits & API Quotas**: The Facebook Graph API implements aggressive rate limits. Frequent synchronizations (like hourly metrics aggregation or 15-minute engine jobs) risk API throttling.
- **Lack of Authentication Checks in Mock Modes**: Some endpoints may bypass verification if they fail back to mock databases, risking unauthorized tenant manipulation.
- **Testing Coverage**: As detailed in [TESTING.md](file:///c:/Users/Administrator/Desktop/traffic-master-ai%20(1)/.planning/codebase/TESTING.md), there is no automated test runner configured, increasing the risk of code regressions.
