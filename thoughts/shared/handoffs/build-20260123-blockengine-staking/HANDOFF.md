# Handoff: Blockengine Staking Portfolio

## Status
**Phase 2 Complete** - Ready for local testing

## Quick Start (on your Mac)

```bash
# Clone or navigate to repo
cd canonical

# Install and test
npm install
npm run test

# Start dev server
npm run dev
```

## What's Built

### Phase 1: Project Foundation
- Next.js 14 + TypeScript + Tailwind
- Vitest (unit) + Playwright (E2E)
- SQLite + Drizzle ORM
- Database schema for staking sub-ledger

### Phase 2: Data Layer Services
| Service | File | Purpose |
|---------|------|---------|
| Rollup | `src/services/rollup.ts` | Aggregate validators → custodians → portfolio |
| Reconciliation | `src/services/reconciliation.ts` | Compare internal vs external statements |
| Exceptions | `src/services/exceptions.ts` | Detect anomalies (value changes, stuck validators, etc.) |

### Tests (TDD)
- `tests/db/schema.test.ts` - Schema validation
- `tests/services/rollup.test.ts` - Rollup logic
- `tests/services/reconciliation.test.ts` - Reconciliation logic
- `tests/services/exceptions.test.ts` - Exception detection

## Remaining Work

| Phase | Tasks |
|-------|-------|
| 3 | API routes (`/api/portfolio`, `/api/validators`, etc.) |
| 4 | Dashboard UI components |
| 5 | Drilldown pages |
| 6 | Report generation (PDF/CSV) |
| 7 | Exception queue UI |
| 8 | E2E tests + optimization |

## Key Files

```
src/
├── domain/types.ts        # Core domain types
├── db/schema.ts           # Database schema
├── db/client.ts           # DB connection
└── services/
    ├── rollup.ts          # Portfolio aggregation
    ├── reconciliation.ts  # Variance detection
    └── exceptions.ts      # Anomaly detection
```

## Resume Command

```
/build resume thoughts/shared/handoffs/build-20260123-blockengine-staking/
```

Or continue manually with Phase 3 (APIs).

## GitHub
https://github.com/Esk3nder/canonical
