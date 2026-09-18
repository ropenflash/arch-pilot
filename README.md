# ArchPilot

**Design better systems with AI.**

ArchPilot is an AI-powered System Design Copilot. You describe a software system; it returns functional and non-functional requirements, capacity math, a component architecture, APIs, a data model, trade-offs, failure scenarios, an interactive diagram, and a principal-architect review.

## Why ArchPilot?

Most AI coding tools generate code.

ArchPilot focuses on the decisions that come before the code.

For every major choice it asks:

- WHY?
- WHAT ARE THE TRADE-OFFS?
- WHEN DOES THIS BREAK?
- HOW DOES IT SCALE?
- WHAT HAPPENS WHEN IT FAILS?

## Screenshots

> Place product screenshots here after first run.

- `docs/screenshots/dashboard.png` — landing hero and example briefs
- `docs/screenshots/design-form.png` — system design input
- `docs/screenshots/architecture.png` — interactive React Flow diagram
- `docs/screenshots/review.png` — architecture review findings

## Features

- Structured system design generation (strict JSON, Zod-validated)
- Interactive architecture diagram (zoom, pan, select, fit, minimap, PNG export)
- Deterministic capacity calculations in TypeScript (the model does not invent arithmetic)
- Technology decisions, trade-offs, and realistic failure scenarios
- Separate architecture review that does not regenerate the design
- Project save / list / delete / duplicate
- Public read-only share URLs at `/design/[id]`
- Ollama (default) and OpenAI-compatible providers
- Seeded example designs: e-commerce, ride sharing, video streaming

## Architecture

V1 is a Next.js App Router application. AI calls run only on the server. Persistence is PostgreSQL via Prisma.

```text
Browser  →  Next.js UI
               │
               ├── Route handlers (/api/design, /api/review, /api/projects)
               │         │
               │         ├── AIProvider (Ollama | OpenAI-compatible)
               │         └── Prisma / PostgreSQL
               │
               └── Capacity + graph libraries (deterministic)
```

Future versions are intentionally not coupled to this V1 path:

| Version | Direction |
| --- | --- |
| V2 | Redis caching of generations |
| V3 | Kafka event-driven generation pipeline |
| V4 | Multi-agent: Requirements → Capacity → Architecture → Database → Security → Reviewer |
| V5 | Architecture A vs B comparison |
| V6 | Cost estimation |
| V7 | Production-ready starter repos |

## Tech stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS + shadcn-style primitives
- React Flow (`@xyflow/react`)
- PostgreSQL + Prisma
- Zod
- Lucide React
- Vitest

## Local setup

Requires Node.js 20+ and PostgreSQL 16 (Docker Compose is provided).

```bash
git clone <repo>
cd arch-pilot
cp .env.example .env
npm install
```

### Database

Docker:

```bash
docker compose up -d
npx prisma migrate dev
npx prisma db seed
```

Local Postgres (user `postgres` / password `postgres` / database `archpilot`):

```bash
createdb archpilot
npx prisma migrate dev
npx prisma db seed
```

### Ollama

Install [Ollama](https://ollama.com), then pull the model named in `.env` (do not hard-code it in source):

```bash
ollama pull qwen3
ollama serve
```

Default configuration:

```env
AI_PROVIDER="ollama"
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="qwen3"
```

If Ollama is down, the UI shows:

> Local AI provider unavailable. Configure another AI provider or start Ollama.

Seeded example designs remain readable without a live model.

### OpenAI-compatible provider

```env
AI_PROVIDER="openai"
OPENAI_API_KEY="sk-..."
OPENAI_BASE_URL="https://api.openai.com/v1"
OPENAI_MODEL="gpt-4o-mini"
```

`OPENAI_BASE_URL` can point at any OpenAI-compatible gateway. API keys never leave the server.

### Running locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build
npm run start
npm run lint
npm run typecheck
npm test
npm run db:migrate
npm run db:seed
```

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `AI_PROVIDER` | `ollama` (default) or `openai` |
| `OLLAMA_BASE_URL` | Ollama host |
| `OLLAMA_MODEL` | Model name (required for Ollama; never hard-coded) |
| `OPENAI_API_KEY` | Secret for OpenAI-compatible APIs |
| `OPENAI_BASE_URL` | Compatible chat completions base URL |
| `OPENAI_MODEL` | Model name for the compatible API |

`.env` is gitignored. Commit `.env.example` only.

## API documentation

All errors use:

```json
{
  "error": {
    "code": "AI_PROVIDER_UNAVAILABLE",
    "message": "The configured AI provider is unavailable."
  }
}
```

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/design` | Generate a system design from a brief |
| `GET` | `/api/design` | Provider health (also `GET /api/provider`) |
| `POST` | `/api/review` | Review an existing design (does not regenerate) |
| `GET` | `/api/projects` | List projects |
| `POST` | `/api/projects` | Save a project |
| `GET` | `/api/projects/:id` | Fetch one project |
| `PUT` | `/api/projects/:id` | Update name/input/design/review |
| `DELETE` | `/api/projects/:id` | Delete |
| `POST` | `/api/projects/:id?action=duplicate` | Duplicate |

`POST /api/design` body:

```json
{
  "name": "Scalable E-commerce Platform",
  "description": "Design an e-commerce platform capable of handling 1 million DAU.",
  "scale": {
    "dau": 1000000,
    "peakTrafficMultiplier": 5,
    "readWriteRatio": "30:1",
    "averageRequestSizeBytes": 1200,
    "expectedStorageGrowthGbPerDay": 40,
    "requestsPerUserPerDay": 50
  },
  "requirements": {
    "functional": ["Cart", "Checkout"],
    "nonFunctional": ["99.99% availability"]
  }
}
```

Request bodies are capped at 512 KiB. AI output is extracted from markdown if needed, validated with Zod, and repaired once. Invalid output is never rendered as a design.

## Security notes

- AI calls are server-side only
- Secrets live in environment variables
- User text is sanitized before persistence
- AI output is treated as data, never executed as code or shell

## Future roadmap

See the version table above. Recommended next step for **V2**: cache identical briefs in Redis so repeat generations are cheap and fast, without changing the provider contract.

## License

Private / unpublished unless otherwise specified.
