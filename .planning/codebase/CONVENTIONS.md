# Coding Conventions

This document outlines the coding standards, patterns, styling rules, and error handling mechanisms across the project.

*Last Updated: 2026-06-10*

## 1. Code Style & Syntax

- **Module Syntax**: ES Modules (`import`/`export`) are used natively in both frontend and backend modules.
- **Code Flow**: Clean asynchronous workflows are structured using `async/await` patterns. Promises are chained with standard catch clauses only when necessary.
- **Indentation**: 4-space indentation is standard for config files and adapters, while 2-space is standard for React JSX elements.
- **Syntax Elements**: Modern JavaScript patterns (optional chaining `?.`, nullish coalescing `??`, object destructuring, and arrow functions) are utilized.

## 2. Frontend Conventions

- **React Architecture**: Functional components with React hooks.
- **State Management**: Client-side states are grouped into slices inside a single Zustand store in [src/store/useStore.js](file:///c:/Users/Administrator/Desktop/traffic-master-ai%20(1)/src/store/useStore.js) and persisted automatically.
- **Styling**: Component styles are maintained in dedicated `.css` sheets imported next to the JSX elements. Utility utility classes are styled through Tailwind CSS v4 directives.
- **Data Fetching**: Backend REST endpoints and Supabase clients are used to retrieve and publish changes.

## 3. Backend Conventions

- **Express Patterns**: Controllers are written as standalone async route handler functions.
- **Express Middleware**: Routers implement verification middleware, tenant verification pipelines (`validateTenant`), security policies (`helmet`), and CORS rules.
- **Response Format**: Controllers follow a unified response structure:
  - Success responses return HTTP 200/201 with descriptive payloads.
  - Error responses are caught by a global express error handler middleware and return clean JSON structures containing message strings (with call stacks shown only in development mode).
- **ORM Mocking**: Database schemas are mapped to objects mimicking Mongoose's API methods (e.g., `findOne()`, `find()`, `create()`, and `findOneAndUpdate()`) via [server/models/supabaseAdapter.js](file:///c:/Users/Administrator/Desktop/traffic-master-ai%20(1)/server/models/supabaseAdapter.js).

## 4. Error Handling

- **Frontend**: API and database calls are wrapped in standard `try/catch` scopes. Errors are logged to the console and displayed to the user via toast notifications or UI feedback.
- **Backend**: Every controller wraps database calls in `try/catch`. If an error occurs, it is logged via Winston/Console and passed to the next Express error handler middleware.
