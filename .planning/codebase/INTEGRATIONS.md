# External Integrations

This document logs all external APIs, databases, auth providers, and webhooks integrated into the system.

*Last Updated: 2026-06-10*

## 1. Supabase Integration

Supabase acts as the backend-as-a-service database layer.

- **Authentication**: Fully integrated for user signup, login, and callback verification.
- **Client Access**: Instantiated on the frontend in [src/lib/supabase.js](file:///c:/Users/Administrator/Desktop/traffic-master-ai%20(1)/src/lib/supabase.js) and the backend in [server/config/supabase.js](file:///c:/Users/Administrator/Desktop/traffic-master-ai%20(1)/server/config/supabase.js).
- **Row Level Security (RLS)**: Configured inside PostgreSQL migrations to restrict record viewing and editing to authorized users (`auth.uid() = user_id`).
- **Edge Functions**:
  - `meta-auth-start`: Initiates the Facebook OAuth redirect URL.
  - `meta-auth-callback`: Exhanges short-lived code for Meta user token.
  - `meta-get-business-entities`: Queries Business Managers and Ad Accounts.
  - `meta-sync`: Synchronizes all Campaign/AdSet/Ad structures and performance indicators.
  - `meta-refresh-token`: Renews access tokens to prevent expiration.

## 2. Meta Ads (Facebook Graph API) Integration

Meta Ads integration synchronizes and publishes campaigns and metrics.

- **Authentication Flow**:
  1. User initiates OAuth on frontend `/integrations` page.
  2. Redirection via callback `/auth/callback` to backend `/api/auth/facebook/callback`.
  3. Short-lived user token swapped for a Long-Lived User Access Token (valid for 60 days).
  4. Token stored inside the `meta_tokens` table in Supabase.
- **API Version**: Uses Graph API version `v20.0` or SDK endpoints.
- **Node.js SDK**: `facebook-nodejs-business-sdk` imports `AdAccount`, `Campaign`, `AdSet`, `Ad` structures.
- **Axios Fallback**: Direct Graph API endpoint invocations implemented in case SDK initialization fails.
- **Data Synchronizations**:
  - **Campaigns**: Fetches name, status, objective, budget limit types, start and end dates.
  - **Insights**: Retrieves campaign-level metrics (Impressions, Clicks, Spend) and derives performance KPI parameters.

## 3. Mocked Integrations

Other traffic and communication providers are mocked on the client side:
- **Google Ads**: Details and charts rendered using client-side generated mocks (see [src/pages/GoogleAds.jsx](file:///c:/Users/Administrator/Desktop/traffic-master-ai%20(1)/src/pages/GoogleAds.jsx)).
- **WhatsApp**: Simulated live message exchange with custom AI responses (see [src/pages/WhatsApp.jsx](file:///c:/Users/Administrator/Desktop/traffic-master-ai%20(1)/src/pages/WhatsApp.jsx)).
- **Instagram, TikTok, Twitter, Mailchimp**: Toggleable status markers within [src/pages/Integrations.jsx](file:///c:/Users/Administrator/Desktop/traffic-master-ai%20(1)/src/pages/Integrations.jsx) to simulate state changes.
