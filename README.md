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
- Docker (recommended) or PostgreSQL 14+

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
2. Start PostgreSQL in Docker
3. Run database migrations
4. Seed demo data (if database is empty)
5. Start the dev server

Open [http://localhost:3000](http://localhost:3000)

## Local Setup (Manual PostgreSQL)

<details>
<summary>Click to expand</summary>

### 1. Install dependencies

```bash
git clone https://github.com/Esk3nder/canonical.git
cd canonical
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

Edit `.env`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/canonical_staking
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

</details>

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:setup` | **One-command setup**: starts postgres, runs migrations, seeds, and starts dev server |
| `npm run dev` | Start development server (requires postgres running) |
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
| `npm run db:reset` | Delete database and start fresh |

## Docker Deployment (Full Stack)

Run the entire application with a single command:

```bash
# Clone the repository
git clone https://github.com/Esk3nder/canonical.git
cd canonical

# Start everything (PostgreSQL + App + Migrations)
docker compose up -d

# Seed demo data (optional)
docker compose exec app npx tsx scripts/seed.ts
```

Open [http://localhost:3000](http://localhost:3000)

### Docker Commands

```bash
docker compose up -d        # Start all services
docker compose down         # Stop all services
docker compose logs -f app  # View app logs
docker compose ps           # Check service status
docker compose build        # Rebuild after code changes
```

### Development with Docker

For local development with hot reload:

```bash
# Start only PostgreSQL
docker compose up -d postgres

# Run app locally
npm install
npm run dev
```

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
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS
- **Testing**: Vitest + Playwright
- **State**: TanStack Query

## License

Private
