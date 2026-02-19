# Prodacto

AI-powered Product Management copilot that turns voice and text into structured product artifacts — PRDs, scored backlogs, business cases, and more.

## What It Does

Prodacto helps Product Managers and Product Owners move faster by automating the tedious parts of their workflow:

- **Voice-First Input** — Describe features by speaking; AI transcribes, classifies, and structures your thoughts.
- **Smart Backlog Generation** — Layered (Design → Backend → Frontend → QA), dependency-aware, day-based estimates with delivery criteria.
- **PRD Generator** — AI writes 9-section PRDs (Overview, Problem, Goals, User Stories, Scope, Technical, Rollout, Risks, Open Questions) with inline editing.
- **AI Review & Coaching** — CPO-level scoring and feedback on backlogs and PRDs across multiple dimensions.
- **Business Case Builder** — ROI projections, cost of delay analysis, and BUILD/DEFER/KILL recommendations.
- **A/B Test Planner** — Hypothesis refinement, sample size calculation, metric recommendations, and go/no-go verdicts.
- **Context Vault** — Store company info, personas, competitor data, and constraints; AI uses it automatically for smarter output.
- **Voice Studio** — Full-screen voice workspace with automatic transcription, classification, and structured output.
- **Market Analysis** — One-click comprehensive reports with TAM/SAM/SOM, competitors, and go-to-market strategy.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| AI | OpenAI GPT-4o (text), Whisper (speech-to-text) |
| State | Zustand |
| Payments | Stripe |

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project
- An OpenAI API key

### Setup

1. Clone the repository:

```bash
git clone https://github.com/your-username/prodacto-app.git
cd prodacto-app
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file from the example and fill in your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-key
```

4. Run the database schema in Supabase SQL Editor:

```bash
# Copy the contents of supabase-schema.sql and execute in Supabase Dashboard → SQL Editor
```

5. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
src/
├── app/
│   ├── (app)/              # Authenticated app pages
│   │   ├── dashboard/      # Main dashboard with quick actions
│   │   ├── projects/       # Project management
│   │   ├── prd/            # PRD generator & editor
│   │   ├── backlog/        # Backlog management & smart generation
│   │   ├── chat/           # AI chat interface
│   │   ├── context-vault/  # Knowledge base for AI context
│   │   ├── ai-review/      # CPO-level review & coaching
│   │   ├── business-case/  # ROI & financial analysis
│   │   ├── experiments/    # A/B test planner
│   │   ├── voice-studio/   # Full-screen voice workspace
│   │   └── market-analysis/# Market analysis reports
│   ├── (auth)/             # Login & signup pages
│   ├── api/                # API routes
│   └── page.tsx            # Landing page
├── components/
│   ├── app/                # App components (Sidebar, OnboardingTour)
│   └── landing/            # Landing page components
└── lib/                    # Utilities (Supabase clients, OpenAI, auth)
```

## License

Private — All rights reserved.
