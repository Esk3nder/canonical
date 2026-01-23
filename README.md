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

## Quick Start (Docker)

```bash
# Clone and install
git clone https://github.com/Esk3nder/canonical.git
cd canonical
npm install

# Start PostgreSQL
docker compose up -d

# Configure environment
cp .env.example .env.local

# Run migrations
npm run db:generate
npm run db:migrate

# Start dev server
npm run dev
```

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
cp .env.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/canonical_staking
```

### 4. Run migrations

```bash
npm run db:generate
npm run db:migrate
```

### 5. Start server

```bash
npm run dev
```

</details>

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:e2e` | Run E2E tests (Playwright) |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Apply migrations |
| `npm run db:studio` | Open Drizzle Studio |

## Docker Commands

```bash
docker compose up -d      # Start PostgreSQL
docker compose down       # Stop PostgreSQL
docker compose logs -f    # View logs
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
