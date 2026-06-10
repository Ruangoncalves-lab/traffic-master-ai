# Technology Stack

This document maps the programming languages, runtimes, frameworks, dependencies, and configuration mechanisms used in the TrafficPro/TrafficMaster AI system.

*Last Updated: 2026-06-10*

## Languages & Runtimes

- **Frontend Environment**: React running in the browser, built using Vite.
- **Backend Environment**: Node.js runtime running an Express server.
- **Programming Language**: JavaScript (ES Modules syntax using `"type": "module"` in both `package.json` configurations).
- **Database Language**: PostgreSQL (SQL migrations for Supabase) and JSON/JavaScript files for mocked databases.

## Frontend Stack & Dependencies

The frontend is defined in the root directory ([package.json](file:///c:/Users/Administrator/Desktop/traffic-master-ai%20(1)/package.json)):

- **Core Framework**: React v19.2.0 & React DOM v19.2.0.
- **Routing**: React Router DOM v7.9.6.
- **State Management**: Zustand v5.0.8 (client-side state persistence stored in localStorage under key `traffic-master-storage`).
- **Styling**: Tailwind CSS v4.1.17 + PostCSS + Autoprefixer for modular vanilla CSS styles.
- **Icons**: Lucide React v0.554.0.
- **Animations**: Framer Motion v12.23.24.
- **Charts & Reports**: Recharts v3.5.0.
- **Drag and Drop**: `@hello-pangea/dnd` v18.0.1.
- **Date Management**: `date-fns` v4.1.0.
- **Utilities**: `uuid` v13.0.0.

## Backend Stack & Dependencies

The backend is located in the `server` directory ([server/package.json](file:///c:/Users/Administrator/Desktop/traffic-master-ai%20(1)/server/package.json)):

- **Web Server**: Express v4.18.2.
- **Scheduler**: `node-cron` v3.0.2 for executing hourly and periodic background tasks.
- **Security & Headers**: `helmet` v7.0.0, `cors` v2.8.5, and `express-rate-limit` v7.1.0.
- **Authentication**: `jsonwebtoken` v9.0.2 for JWT management and `bcryptjs` v2.4.3 for hashing passwords.
- **File Upload**: `multer` v1.4.5-lts.1 for parsing multi-part form data.
- **HTTP Client**: `axios` v1.13.2 for external request execution.
- **Logging**: `winston` v3.11.0 for application logs and `morgan` v1.10.0 for HTTP request logging.

## Database & ORM Stack

The database integration has dual support:
1. **Supabase & PostgreSQL**: Integrated via `@supabase/supabase-js` v2.86.0 and database queries managed by a custom simulated Mongoose ORM adapter.
2. **Local Mock Database**: A local JSON file database located at `server/data.json` managed by [server/models/mockDb.js](file:///c:/Users/Administrator/Desktop/traffic-master-ai%20(1)/server/models/mockDb.js) mimicking the Mongoose model API.
3. **Mongoose Driver**: Mongoose v7.6.3 for connecting to a MongoDB URI.

## Configurations

- **Frontend Variables**: `.env` (maps `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`).
- **Backend Variables**: `server/.env` (maps variables like `PORT`, `MONGO_URI`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `JWT_SECRET`, and Meta credentials).
