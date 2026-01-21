You are my senior full-stack architect. Before writing any code, you MUST produce a complete plan and “skills checklist” for every feature, then implement step-by-step.

Tech stack (strict):
- Laravel 12 (PHP 8.3+), MySQL
- Inertia.js + React + TypeScript
- Tailwind + shadcn/ui
- Default theme: RED via tokens (CSS variables). No hardcoded random red classes everywhere.

Project goal:
Standalone monolith app with:
A) Finance Ledger (income/expense/transfer + reports)
B) Facebook Business / Messenger integration (connect pages + webhook + inbox + reply)

========================================================
PHASE 0 — PLANNING ONLY (NO CODE)
========================================================

Deliverables in Phase 0 (must be detailed):
1) Product scope
   - What’s included, what’s explicitly excluded (v1 boundaries)
2) User roles + permissions (v1: single admin is ok, but note extension path)
3) Data model (tables + key fields + relationships)
4) Route map
   - Web (Inertia) routes
   - API routes (if any internal endpoints needed)
5) UI page map + components map
   - Pages list
   - Reusable components list (tables, dialogs, filters, forms, empty states)
6) “Skill checklist per feature”
   For EACH feature below, list:
   - Backend skills/techniques (validation, transactions, policies, services, queues)
   - Frontend skills/techniques (Inertia forms, shadcn components, state patterns)
   - Testing skills (feature tests/unit tests)
   - Security skills (where applicable)
   - Performance considerations

7) Step-by-step implementation roadmap
   - Steps ordered to minimize rework
   - Each step includes: objective, files to touch, acceptance criteria

Only after Phase 0 is complete, start Phase 1.

========================================================
FEATURES LIST (you must plan + assign skills for EACH)
========================================================

FOUNDATION
F0. Project bootstrap (Laravel 12 + Inertia React TS + shadcn + red theme tokens)
F1. Auth + AppLayout/AuthLayout + navigation + toast system
F2. Shared UI primitives:
    - DataTable pattern (server pagination optional v1)
    - Dialog form pattern (create/edit)
    - Filter bar pattern (date range, select)
    - Empty states, loading states, error states

FINANCE DOMAIN
FIN-1 Accounts CRUD
FIN-2 Categories CRUD (income|expense)
FIN-3 Transactions CRUD:
      - income
      - expense
      - transfer (DB transaction required)
      - validation and consistent money handling
FIN-4 Balance calculation + account statement
FIN-5 Reports:
      - daily summary
      - monthly summary
      - category totals
      - account statement with filters
FIN-6 Audit basics:
      - created_by, timestamps
      - optional activity log note for future

FACEBOOK DOMAIN
FB-1 Facebook OAuth connect + encrypted token storage + disconnect
FB-2 Fetch/store managed Pages + page access tokens + refresh strategy notes
FB-3 Webhook endpoint:
      - GET verify token
      - POST receive
      - signature verify X-Hub-Signature-256 (app secret)
      - rate limit
      - store raw payload
      - dispatch queue job
FB-4 Webhook processing job:
      - parse message events
      - upsert conversation (page_id + psid)
      - store incoming messages
FB-5 Inbox UI:
      - page selector
      - conversation list (search + sort)
      - message thread
      - polling or simple refresh button (v1)
FB-6 Reply:
      - send message via Graph API Send API
      - store outgoing messages
      - show send status (sent/failed basic)
FB-7 Debug tools:
      - webhook event log UI (admin only) (v1 minimal)

CROSS-CUTTING
X-1 Error handling + logging policy (no secrets)
X-2 Testing suite
X-3 README + environment variables + deployment notes

========================================================
ARCHITECTURE RULES (strict)
========================================================
- Use Domain structure:
  - app/Domains/Finance/*
  - app/Domains/Facebook/*
- Use Services:
  - Finance: TransactionService, ReportService, BalanceService
  - Facebook: FacebookAuthService, FacebookPageService, MessengerWebhookService, MessengerSendService
- Use Form Requests for validation
- Use Enums:
  - TransactionType (income, expense, transfer)
  - MessageDirection (in, out)
- Use DB transactions for transfer + any balance-critical writes
- Use queues for webhook processing (database driver ok)
- Store FB tokens encrypted at rest

========================================================
UI RULES (strict)
========================================================
- React + TypeScript everywhere
- shadcn/ui components required
- Red theme via tokens (CSS variables) in one place:
  - primary/ring/focus/active states consistent
- Inertia forms for create/edit with proper server validation display
- Reusable UI components, avoid duplication

========================================================
PHASE 1+ — IMPLEMENTATION STYLE
========================================================
After Phase 0 planning, implement step-by-step.
For EACH step:
1) short explanation
2) list files to create/modify
3) FULL code for those files (no pseudo-code)
4) commands to run
5) acceptance criteria checklist

Start now with PHASE 0 only. Do NOT write code yet.
