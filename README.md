# Canonical Staking Portfolio

Institutional staking portfolio dashboard built with Next.js 14, PostgreSQL, and Drizzle ORM.

## Features

- Portfolio overview with KPIs (total value, APY, validator count)
- State buckets visualization (active, in-transit, rewards, exiting)
- Custodian distribution and comparison
- Validator performance tracking
- Exception detection and workflow management
- Report generation (CSV, PDF export)
- Drilldown pages for custodians and validators

## Prerequisites

- Node.js 18+
- PostgreSQL 14+

## Quick Start

```bash
# Clone and install
git clone https://github.com/Esk3nder/canonical.git
cd canonical
npm install

# One command to set up and start everything
npm run dev:setup
```

This command will:
1. Create `.env` from `.env.example` (if needed)
2. Create the local PostgreSQL database (if needed)
3. Push the database schema
4. Seed demo data (if database is empty)
5. Start the dev server

Open [http://localhost:3000](http://localhost:3000)

## Manual Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create database

```bash
createdb canonical_staking
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` if your local PostgreSQL requires credentials:

```env
POSTGRES_URL=postgresql://username:password@localhost:5432/canonical_staking
```

### 4. Push schema and seed data

```bash
npm run db:push
npm run db:seed
```

### 5. Start server

```bash
npm run dev
```

## Deploying to Vercel

1. Push your repository to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add a Vercel Postgres database in the project settings (Storage tab)
4. Vercel automatically sets `POSTGRES_URL` and related env vars
5. Run `npm run db:push` locally against the Vercel database to initialize the schema (set `POSTGRES_URL` to the Vercel connection string)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:setup` | **One-command setup**: creates DB, pushes schema, seeds, and starts dev server |
| `npm run dev` | Start development server (requires PostgreSQL running) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:e2e` | Run E2E tests (Playwright) |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Apply migrations |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Drizzle Studio |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── custodians/        # Custodian detail pages
│   ├── validators/        # Validator detail pages
│   ├── exceptions/        # Exception queue
│   └── reports/           # Report generation UI
├── components/dashboard/  # Dashboard components
├── db/                    # Schema and client
├── services/              # Business logic
└── lib/                   # Utilities
tests/
├── api/                   # API tests
├── components/            # Component tests
├── services/              # Service tests
└── e2e/                   # End-to-end tests
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Vercel Postgres with Drizzle ORM
- **Styling**: Tailwind CSS
- **Testing**: Vitest + Playwright
- **State**: TanStack Query
- **Deployment**: Vercel

## License

Private
