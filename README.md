<div align="center">

# 💸 Emwrap

### Collaborative Expense Intelligence, Reimagined

_A full-stack multi-tenant financial platform with conversational AI, built with Laravel 11 and React_

![Laravel](https://img.shields.io/badge/Laravel_11-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI_GPT--4o-412991?style=for-the-badge&logo=openai&logoColor=white)

</div>

---

## What is Emwrap?

Emwrap is a collaborative expense management platform that goes beyond mere transaction logging. Teams operate within isolated workspaces, enforce category-level budgets, and — crucially — converse directly with an AI assistant that understands their financial data in real time.

The application treats artificial intelligence not as a superficial embellishment, but as a first-class architectural concern: GPT-4o-mini is woven into four distinct workflows, each designed to surface insight that would otherwise require manual interpretation. The result is a platform that doesn't just record where money went — it helps teams understand why, and what to do about it.

---

## 🤖 AI Integration

Emwrap's intelligence layer is powered by the OpenAI API and manifests across four purposefully distinct surfaces:

### Conversational Financial Assistant

The centrepiece of the AI integration. A dedicated chat interface allows users to hold a natural, multi-turn conversation with an assistant that is contextually aware of the workspace's current expenses, active budget allocations, and spending patterns. Questions as specific as _"Which category is closest to its budget ceiling this month?"_ and as broad as _"How should I think about building an emergency fund?"_ receive coherent, data-informed responses. Conversation history is maintained within the session, enabling the assistant to reason across multiple exchanges rather than treating each message in isolation.

### Semantic Expense Categorisation

When logging a new expense, users may invoke the AI categorisation prompt with a single click. The expense title is dispatched to GPT-4o-mini alongside the workspace's defined categories, and the model returns a semantically matched suggestion — distinguishing, for instance, between _"AWS invoice"_ and _"team lunch"_ without explicit user intervention. The suggestion is applied to the category selector in real time, materially reducing the friction of data entry.

### Proactive Spending Insights

The dashboard surfaces a curated set of natural-language observations derived from two months of aggregated workspace data. Rather than presenting raw figures, the model identifies behavioural patterns — anomalous category spikes, favourable month-over-month trends, budget proximity warnings — and communicates them in plain prose. Insights refresh on demand via a dedicated control, ensuring the analysis remains current as new transactions are logged.

### AI-Augmented Report Summaries

On the Reports page, users may commission a concise professional summary of any selected month's expenditure. The model synthesises total spend, transaction volume, and category distribution into a three-sentence executive narrative — suitable for distribution to stakeholders who require context without granular detail. This summary may optionally be embedded as a prefixed annotation within the CSV export, producing a self-contained document that narrates its own data.

> All AI features degrade gracefully in the absence of an API key or in the event of upstream unavailability. The platform remains fully operational without AI; the intelligence layer exists to augment the experience, not to underpin it.

---

## ✨ Core Features

- **Multi-workspace architecture** — users may belong to multiple isolated workspaces simultaneously, with all data strictly scoped per workspace and zero cross-tenant leakage
- **Role-based access control** — Owners hold exclusive authority over membership management, workspace configuration, and invitation issuance; Members retain full expense and budget access
- **Tokenised invitations** — time-limited, single-use invite links enable frictionless onboarding of collaborators without manual admin intervention
- **Budget progress tracking** — per-category monthly limits render animated progress indicators that transition from emerald to red upon breaching the 80% utilisation threshold
- **Streaming CSV export** — reports are streamed server-side via PHP's native `fputcsv` with no third-party dependency, scaling to arbitrarily large datasets without memory overhead
- **Dark / light mode** — system-wide theme toggle with persistent preference

---

## 🛠️ Tech Stack

| Layer              | Technology                              |
| ------------------ | --------------------------------------- |
| Backend framework  | Laravel 11                              |
| Authentication     | Laravel Sanctum — stateless token-based |
| Database           | MySQL                                   |
| AI model           | OpenAI GPT-4o-mini                      |
| Frontend framework | React 18 + Vite                         |
| Language           | TypeScript                              |
| Animations         | Framer Motion                           |
| Charts             | Recharts                                |
| Styling            | Tailwind CSS                            |
| Notifications      | Sonner                                  |
| HTTP client        | Axios                                   |

---

## 🏗️ Architecture Notes

**Multi-tenancy via workspace scoping**
Rather than separate databases per tenant, all entities carry a `workspace_id` foreign key. Every query is explicitly scoped to the authenticated user's workspace, ensuring complete isolation without infrastructure complexity.

**Stateless token authentication**
Sanctum issues opaque personal access tokens rather than session cookies. The frontend persists the token in `localStorage` and attaches it to every outbound request via an Axios interceptor — an approach that is trivially extensible to future mobile or third-party clients.

**Conversational AI with stateful context**
The chat endpoint reconstructs the full conversation history on every request, passing it as a structured message array to the OpenAI completions API. The workspace's current financial snapshot is injected into the system prompt at call time, ensuring the model's responses are grounded in live data rather than approximations.

**Native CSV streaming**
The export endpoint writes directly to PHP's output buffer via a stream response, bypassing the memory overhead of constructing the full dataset in memory — a pattern that scales to arbitrarily large workspaces without modification.

---

## 🚀 Running Locally

### Prerequisites

- PHP 8.2+, Composer
- MySQL (XAMPP recommended)
- Node.js 18+

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

> The Vite dev server proxies all `/api` requests to `http://127.0.0.1:8000` — no additional CORS configuration required during local development.

### Environment Variables

```env
DB_DATABASE=emwrap
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:8080
FRONTEND_URL=http://localhost:8080

OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx

MAIL_MAILER=log
```

---

## 📁 Project Structure

```
emwrap/
├── backend/                   Laravel 11 REST API
│   ├── app/
│   │   ├── Http/Controllers/  AuthController, WorkspaceController,
│   │   │                      ExpenseController, CategoryController,
│   │   │                      BudgetController, MemberController,
│   │   │                      InvitationController, ReportController,
│   │   │                      AiController
│   │   ├── Models/            User, Workspace, Expense,
│   │   │                      Category, Budget, Invitation
│   │   └── Services/          OpenAiService
│   └── routes/api.php
│
└── frontend/                  React + Vite SPA
    └── src/
        ├── pages/             Dashboard, Expenses, BudgetPage,
        │                      Reports, Chat, SettingsPage,
        │                      Login, Register
        ├── contexts/          AuthContext, WorkspaceContext
        └── lib/               api.ts — Axios instance + interceptor
```

---

<div align="center">

_Part of a PHP developer internship portfolio — backend engineered with Laravel 11, frontend crafted with React and Vite_

</div>
