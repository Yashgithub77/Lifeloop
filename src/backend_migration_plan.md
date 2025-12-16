# LifeLoop Backend Integration Roadmap

This document outlines the steps to transform the LifeLoop prototype into a fully functional application with a real backend, database, and live third-party integrations.

## Phase 1: Database & Authentication Layer
**Objective:** Replace in-memory `store.ts` with a persistent database and secure user accounts.

1.  **Select a Database:**
    *   **Recommendation:** **PostgreSQL** (via Supabase or Neon). It's relational, robust, and scales well.
    *   **ORM:** Use **Prisma** to manage database schema and queries. It provides strict type safety which aligns perfectly with our TypeScript codebase.

2.  **Implement Authentication:**
    *   **Library:** **Clerk** or **NextAuth.js**.
    *   **Setup:**
        *   Create `User` table to store preferences (college hours, focus times).
        *   Enable Google Sign-In (simplifies later Google Calendar integration).
        *   Protect all `/dashboard` routes and `/api` endpoints with auth middleware.

3.  **Data Migration:**
    *   Create `Goal`, `Task`, `Action`, `JournalEntry` tables in Postgres.
    *   Rewrite all API routes (`src/app/api/*`) to use Prisma Client instead of `store.ts`.
    *   *Example:* `store.getTasks()` becomes `await prisma.task.findMany({ where: { userId: session.user.id } })`.

## Phase 2: True AI Integration
**Objective:** Replace the hardcoded logic in `planner.ts` with a real LLM for dynamic, intelligent planning.

1.  **AI Provider Setup:**
    *   **Recommendation:** **Project IDX AI** or **OpenAI API** or **Google Gemini API**.
    *   Set up API keys in `.env.local`.

2.  **Refactor Planner Agent:**
    *   **Current:** `generateStudyPlan` uses a `for` loop with hardcoded "Unit 1...Unit 5" strings.
    *   **New:** Create a prompt:
        > "Act as an academic planner. The user wants to '${goal.title}'. They have ${user.dailyAvailableMinutes} minutes/day. Create a structured 7-day study plan."
    *   Use **Vercel AI SDK** (`ai`) to stream the JSON response directly to the frontend.

3.  **Refactor Replan Agent:**
    *   Feed the LLM the user's actual completion data ("Completed 3/5 tasks, missed Tuesday").
    *   Ask the LLM to generate the `MicroAdjustment` strategies dynamically rather than picking from a predefined list.

## Phase 3: Real Google Integrations
**Objective:** Replace simulated OAuth with real Google APIs.

1.  **Google Cloud Platform (GCP) Setup:**
    *   Create a new project in Google Cloud Console.
    *   Enable **Google Calendar API** and **Google Fitness API**.
    *   Configure OAuth 2.0 Consent Screen (add "Test Users" for development).
    *   Get **Client ID** and **Client Secret**.

2.  **Backend Implementation:**
    *   Use `googleapis` library.
    *   When user clicks "Connect", redirect to Google's OAuth URL (`scope: https://www.googleapis.com/auth/calendar.readonly`).
    *   Store the **Access Token** and **Refresh Token** securely in the User's database record (encrypted).

3.  **Sync Logic:**
    *   Create a Cron Job (e.g., via Vercel Cron or Inngest) to sync data every hour.
    *   **Reading:** Fetch events from `gapi.client.calendar.events.list`.
    *   **Writing:** (Optional) Push LifeLoop tasks *to* their Google Calendar as "Focus Blocks".

## Recommended Tech Stack for Backend
| Component | Recommendation | Why? |
| :--- | :--- | :--- |
| **Framework** | **Next.js** (Current) | You already have it; full-stack capabilities are built-in. |
| **Database** | **Supabase** (PostgreSQL) | Easy setup, built-in Auth option, great GUI. |
| **ORM** | **Prisma** | Best-in-class TypeScript support. |
| **AI** | **Google Gemini** | Excellent reasoning capabilities for planning; generous free tier. |
| **Deployment** | **Vercel** | Seamless Next.js hosting and edge functions. |

## First Steps to Take Now
1.  **Sign up for Supabase** and create a free project.
2.  **Install Prisma:** `npm install prisma --save-dev` then `npx prisma init`.
3.  **Define Schema:** specificy your `Goal` and `Task` models in `prisma.schema`.
