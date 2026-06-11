# Research: Phase 3 Database Robustness

## Codebase Analysis

### Mock DB Transactions Context
* **Current status:** The application utilizes a local mock database inside `server/models/mockDb.js` to store development state in `server/data.json`.
* **Issue:** Under concurrent operations (such as parallel test runs), asynchronous file reading and writing can cause race conditions where data is overwritten.
* **Relevant files:**
  * [mockDb.js](file:///c:/Users/Administrator/Desktop/traffic-master-ai%20%281%29/server/models/mockDb.js)

### SQL Migrations Context
* **Current status:** Supabase migrations inside `supabase/migrations/` handle Meta integration schemas.
* **Goal:** Ensure all migrations are 100% non-destructive and prevent using drop commands on production tables.
* **Relevant files:**
  * [20251204_create_meta_tables.sql](file:///c:/Users/Administrator/Desktop/traffic-master-ai%20%281%29/supabase/migrations/20251204_create_meta_tables.sql)
  * [20251205_meta_integration_v2.sql](file:///c:/Users/Administrator/Desktop/traffic-master-ai%20%281%29/supabase/migrations/20251205_meta_integration_v2.sql)

## Decisions
1. **FIFO Promise Queue:** We will introduce a global `transactionQueue` using a chained Promise pattern to run all reading/writing database actions sequentially.
2. **Schema Declarations Policy:** Standardize a header policy at the top of all SQL migration files explicitly forbidding any `DROP TABLE` executions.
