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
- npm or yarn

## Local Setup

### 1. Clone and install dependencies

```bash
git clone https://github.com/Esk3nder/canonical.git
cd canonical
npm install
```

### 2. Set up PostgreSQL

Create a database:

```bash
createdb canonical_staking
```

Or using psql:

```sql
CREATE DATABASE canonical_staking;
```

### 3. Configure environment

Copy the example environment file and update with your database credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/canonical_staking
```

### 4. Run database migrations

Generate and apply migrations:

```bash
npm run db:generate
npm run db:migrate
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

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

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── portfolio/     # Portfolio overview
│   │   ├── custodians/    # Custodian endpoints
│   │   ├── validators/    # Validator endpoints
│   │   ├── exceptions/    # Exception management
│   │   └── reports/       # Report generation
│   ├── custodians/        # Custodian detail pages
│   ├── validators/        # Validator detail pages
│   ├── exceptions/        # Exception queue
│   └── reports/           # Report generation UI
├── components/
│   └── dashboard/         # Dashboard components
│       ├── KPIBands.tsx
│       ├── StateBuckets.tsx
│       ├── CustodianDistribution.tsx
│       ├── ValidatorTable.tsx
│       └── ExceptionSummary.tsx
├── db/
│   ├── schema.ts          # Drizzle schema definitions
│   └── client.ts          # Database client
├── services/
│   ├── rollup.ts          # Aggregation logic
│   ├── reconciliation.ts  # Variance detection
│   ├── exceptions.ts      # Exception detection
│   └── export/            # CSV/PDF export
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
