# Project Structure

This document outlines the folder layout and naming conventions used across the TrafficPro system.

*Last Updated: 2026-06-10*

## Directory Tree

Below is the directory map highlighting the key locations of the project components:

```text
traffic-master-ai/
├── .planning/                  # GSD Project planning and documentation (created now)
│   └── codebase/               # Codebase maps and technical specifications
├── public/                     # Static assets for the frontend
├── src/                        # React Frontend Source Code
│   ├── assets/                 # SVGs, images, static icons
│   ├── components/             # Reusable UI component modules
│   │   ├── campaigns/          # Campaign management components
│   │   ├── dashboard/          # Analytics and overview dashboard widgets
│   │   ├── Layout/             # UI structural component wrappers
│   │   └── UI/                 # Atomic UI components (Buttons, Inputs, Modals)
│   ├── context/                # React context providers
│   ├── layout/                 # Top-level Page Layout handlers (e.g., MainLayout.jsx)
│   ├── lib/                    # Library setup instances (supabase.js)
│   ├── pages/                  # Page routes view panels
│   │   └── meta/               # Meta Ads analytics view panels
│   ├── store/                  # Client-side store definitions (useStore.js)
│   ├── styles/                 # Theme configuration files
│   ├── utils/                  # Helper utilities and formatters
│   ├── App.css                 # Main layout custom styles
│   ├── App.jsx                 # Routing tree setup
│   ├── index.css               # Core Tailwind V4 stylesheet
│   └── main.jsx                # Frontend mounting script
├── server/                     # Express Backend Source Code
│   ├── config/                 # DB connections and environment setups
│   ├── controllers/            # Endpoint controller actions
│   ├── jobs/                   # Periodical node-cron scripts
│   ├── middleware/             # Request interceptors, validation, rate limits
│   ├── models/                 # Database schema models and client adapters
│   ├── routes/                 # Express routing endpoint mappings
│   ├── services/               # Internal API managers & Meta Ads API connections
│   │   └── meta/               # Meta Graph integrations
│   ├── utils/                  # Backend formatting and calculation helpers
│   ├── data.json               # Local mocked database file
│   └── server.js               # Express application starter script
├── supabase/                   # Supabase Infrastructure
│   ├── functions/              # Edge functions
│   └── migrations/             # SQL migration files
├── index.html                  # Frontend index document
├── vite.config.js              # Vite bundler configurations
└── package.json                # Root package configuration (Frontend focus)
```

## Naming Conventions

- **Frontend Component Files**: Capitalized camel-case (`SidebarItem.jsx`, `MetricCard.jsx`).
- **Page Files**: Capitalized camel-case (`Dashboard.jsx`, `GoogleAds.jsx`), unless grouped under specific scopes (e.g., `src/pages/meta/Dashboard.jsx`).
- **Styles**: Camel-case or matching the page name (`Dashboard.css`, `CRM.css`).
- **Backend Controllers, Routes, Services**: Lower camel-case (`authController.js`, `metaApiRoutes.js`, `metaService.js`).
- **Backend Models**: Capitalized camel-case (`Business.js`, `Core.js`, `System.js`).
- **Database Migrations**: Timestamp prefix followed by descriptive snake-case naming (`20251205_meta_integration_v2.sql`).
