# Implementation Plan: Blockengine Staking Portfolio

## Overview
- **Mode**: TDD (Test-Driven Development)
- **Stack**: TypeScript + Next.js 14 + SQLite + Tailwind
- **Approach**: Write tests first, implement to pass, refactor

## Phase 1: Project Setup & Data Layer Foundation

### Task 1.1: Initialize Next.js Project with Testing
**Tests First:**
- `npm run dev` starts without errors
- `npm run test` runs Vitest
- `npm run lint` passes

**Implementation:**
- Initialize Next.js 14 with TypeScript
- Configure Vitest for unit tests
- Configure Playwright for E2E
- Set up Tailwind CSS
- Configure ESLint + Prettier

### Task 1.2: Database Schema & ORM Setup
**Tests First:**
```typescript
// tests/db/schema.test.ts
describe('Database Schema', () => {
  it('creates validators table with required columns')
  it('creates custodians table with required columns')
  it('creates stake_events table with required columns')
  it('creates exceptions table with required columns')
  it('enforces foreign key relationships')
})
```

**Implementation:**
- Set up Drizzle ORM with SQLite
- Create schema:
  - `entities` (institutional clients)
  - `custodians` (Coinbase, Anchorage, etc.)
  - `operators` (staking operators)
  - `validators` (individual validators)
  - `stake_events` (state transitions, rewards)
  - `exceptions` (anomaly records)
  - `config_history` (mapping changes over time)

### Task 1.3: Core Domain Types
**Tests First:**
```typescript
// tests/domain/types.test.ts
describe('Domain Types', () => {
  it('StakeState enum includes all valid states')
  it('ValidatorStatus correctly categorizes states')
  it('RewardType distinguishes claimable vs unclaimed')
})
```

**Implementation:**
```typescript
// src/domain/types.ts
type StakeState = 'active' | 'in_transit' | 'pending_activation' | 'exiting' | 'exited'
type RewardType = 'claimable' | 'unclaimed' | 'withdrawn'
```

## Phase 2: Staking Sub-Ledger (Data Computation)

### Task 2.1: Validator Rollup Service
**Tests First:**
```typescript
// tests/services/rollup.test.ts
describe('Validator Rollup', () => {
  it('aggregates stake by state bucket')
  it('calculates trailing APY from reward events')
  it('rolls up validators to custodian level')
  it('rolls up custodians to portfolio level')
  it('produces deterministic output for same inputs')
})
```

**Implementation:**
- `src/services/rollup.ts`
- Pure functions for aggregation
- Memoization for performance

### Task 2.2: Reconciliation Service
**Tests First:**
```typescript
// tests/services/reconciliation.test.ts
describe('Reconciliation', () => {
  it('detects variance between internal and external totals')
  it('categorizes variance by type')
  it('links variance to specific validators')
  it('generates variance report')
})
```

**Implementation:**
- `src/services/reconciliation.ts`
- Compare internal rollups vs external statements
- Generate variance explanations

### Task 2.3: Exception Detection Service
**Tests First:**
```typescript
// tests/services/exceptions.test.ts
describe('Exception Detection', () => {
  it('flags material portfolio value change > threshold')
  it('flags unexpected validator count change')
  it('flags in-transit stuck > N days')
  it('flags reward anomaly (drop/spike)')
  it('flags custodian performance divergence')
  it('creates exception with evidence links')
})
```

**Implementation:**
- `src/services/exceptions.ts`
- Configurable thresholds
- Evidence linking

## Phase 3: API Layer

### Task 3.1: Portfolio Overview API
**Tests First:**
```typescript
// tests/api/portfolio.test.ts
describe('GET /api/portfolio', () => {
  it('returns total portfolio value')
  it('returns trailing APY')
  it('returns validator count')
  it('returns state buckets with totals')
  it('returns custodian breakdown')
  it('response time < 200ms for 1000 validators')
})
```

**Implementation:**
- `src/app/api/portfolio/route.ts`
- Cached rollup results
- Response shaping

### Task 3.2: Drilldown APIs
**Tests First:**
```typescript
// tests/api/drilldown.test.ts
describe('Drilldown APIs', () => {
  it('GET /api/custodians/:id returns custodian detail')
  it('GET /api/validators/:id returns validator detail')
  it('GET /api/validators/:id/events returns event history')
  it('includes evidence links in responses')
})
```

**Implementation:**
- `src/app/api/custodians/[id]/route.ts`
- `src/app/api/validators/[id]/route.ts`
- `src/app/api/validators/[id]/events/route.ts`

### Task 3.3: Reporting API
**Tests First:**
```typescript
// tests/api/reports.test.ts
describe('Reporting API', () => {
  it('POST /api/reports generates monthly statement')
  it('includes methodology version in output')
  it('produces same output for same period + inputs')
  it('supports CSV export format')
  it('supports PDF export format')
})
```

**Implementation:**
- `src/app/api/reports/route.ts`
- Statement pack generation
- Export formatters (CSV, PDF)

### Task 3.4: Exceptions API
**Tests First:**
```typescript
// tests/api/exceptions.test.ts
describe('Exceptions API', () => {
  it('GET /api/exceptions returns exception queue')
  it('PATCH /api/exceptions/:id updates status')
  it('includes evidence links')
  it('supports filtering by status')
})
```

**Implementation:**
- `src/app/api/exceptions/route.ts`
- `src/app/api/exceptions/[id]/route.ts`

## Phase 4: Dashboard UI

### Task 4.1: KPI Bands Component
**Tests First:**
```typescript
// tests/components/KPIBands.test.tsx
describe('KPIBands', () => {
  it('renders portfolio value prominently')
  it('renders APY with correct formatting')
  it('renders validator count')
  it('shows loading state')
  it('handles error state')
})
```

**Implementation:**
- `src/components/dashboard/KPIBands.tsx`
- Large, scannable numbers
- Loading/error states

### Task 4.2: State Buckets Component
**Tests First:**
```typescript
// tests/components/StateBuckets.test.tsx
describe('StateBuckets', () => {
  it('renders all four state buckets')
  it('shows values and percentages')
  it('buckets are clickable for drilldown')
  it('highlights anomalies')
})
```

**Implementation:**
- `src/components/dashboard/StateBuckets.tsx`
- Four buckets with values
- Click handlers for drilldown

### Task 4.3: Custodian Distribution Component
**Tests First:**
```typescript
// tests/components/CustodianDistribution.test.tsx
describe('CustodianDistribution', () => {
  it('renders allocation chart')
  it('renders comparison table (no hover needed)')
  it('shows per-custodian APY')
  it('shows 7d/30d change indicators')
  it('supports sorting')
})
```

**Implementation:**
- `src/components/dashboard/CustodianDistribution.tsx`
- Chart + adjacent table
- Sortable columns

### Task 4.4: Validator Table Component
**Tests First:**
```typescript
// tests/components/ValidatorTable.test.tsx
describe('ValidatorTable', () => {
  it('renders validator list')
  it('shows status/state per validator')
  it('shows performance indicators')
  it('supports pagination')
  it('supports filtering by state')
  it('rows link to detail view')
})
```

**Implementation:**
- `src/components/dashboard/ValidatorTable.tsx`
- Sortable, filterable table
- Pagination
- Row click → drilldown

### Task 4.5: Exception Summary Component
**Tests First:**
```typescript
// tests/components/ExceptionSummary.test.tsx
describe('ExceptionSummary', () => {
  it('shows count of open exceptions')
  it('shows most critical exceptions')
  it('links to exception queue')
  it('highlights new exceptions')
})
```

**Implementation:**
- `src/components/dashboard/ExceptionSummary.tsx`
- Summary card
- Quick links

## Phase 5: Drilldown Pages

### Task 5.1: Custodian Detail Page
**Tests First (E2E):**
```typescript
// tests/e2e/custodian-detail.test.ts
test('Custodian detail page', async ({ page }) => {
  await page.goto('/custodians/1')
  await expect(page.getByTestId('custodian-name')).toBeVisible()
  await expect(page.getByTestId('validator-list')).toBeVisible()
  await expect(page.getByTestId('performance-metrics')).toBeVisible()
})
```

**Implementation:**
- `src/app/custodians/[id]/page.tsx`

### Task 5.2: Validator Detail Page
**Tests First (E2E):**
```typescript
// tests/e2e/validator-detail.test.ts
test('Validator detail page', async ({ page }) => {
  await page.goto('/validators/1')
  await expect(page.getByTestId('validator-pubkey')).toBeVisible()
  await expect(page.getByTestId('event-timeline')).toBeVisible()
  await expect(page.getByTestId('evidence-links')).toBeVisible()
})
```

**Implementation:**
- `src/app/validators/[id]/page.tsx`

## Phase 6: Reporting & Export

### Task 6.1: Report Generation Page
**Tests First (E2E):**
```typescript
// tests/e2e/reports.test.ts
test('Generate monthly report', async ({ page }) => {
  await page.goto('/reports')
  await page.selectOption('[data-testid="period"]', '2024-01')
  await page.click('[data-testid="generate"]')
  await expect(page.getByTestId('report-preview')).toBeVisible()
})
```

**Implementation:**
- `src/app/reports/page.tsx`
- Period selector
- Preview
- Export buttons

### Task 6.2: Export Functionality
**Tests First:**
```typescript
// tests/services/export.test.ts
describe('Export Service', () => {
  it('generates valid CSV')
  it('generates valid PDF')
  it('includes methodology version')
  it('includes all required sections')
})
```

**Implementation:**
- `src/services/export/csv.ts`
- `src/services/export/pdf.ts`

## Phase 7: Exception Queue

### Task 7.1: Exception Queue Page
**Tests First (E2E):**
```typescript
// tests/e2e/exceptions.test.ts
test('Exception queue', async ({ page }) => {
  await page.goto('/exceptions')
  await expect(page.getByTestId('exception-list')).toBeVisible()
  await page.click('[data-testid="exception-0"]')
  await expect(page.getByTestId('exception-detail')).toBeVisible()
  await expect(page.getByTestId('evidence-link')).toBeVisible()
})
```

**Implementation:**
- `src/app/exceptions/page.tsx`
- List with filtering
- Status updates
- Evidence links

## Phase 8: Integration & Polish

### Task 8.1: E2E Morning Check Flow
**Tests First:**
```typescript
// tests/e2e/morning-check.test.ts
test('Complete morning check flow', async ({ page }) => {
  await page.goto('/')
  // KPIs visible
  await expect(page.getByTestId('portfolio-value')).toBeVisible()
  // Buckets visible
  await expect(page.getByTestId('active-stake')).toBeVisible()
  // Can drill down
  await page.click('[data-testid="custodian-row-0"]')
  await expect(page).toHaveURL(/\/custodians\//)
})
```

### Task 8.2: Performance Optimization
**Tests First:**
```typescript
// tests/performance/dashboard.test.ts
describe('Dashboard Performance', () => {
  it('initial load < 1s')
  it('API response < 200ms')
  it('client-side navigation < 100ms')
})
```

**Implementation:**
- Query optimization
- Response caching
- Code splitting

## File Structure

```
canonical/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Portfolio overview
│   │   ├── custodians/[id]/page.tsx
│   │   ├── validators/[id]/page.tsx
│   │   ├── reports/page.tsx
│   │   ├── exceptions/page.tsx
│   │   └── api/
│   │       ├── portfolio/route.ts
│   │       ├── custodians/[id]/route.ts
│   │       ├── validators/[id]/route.ts
│   │       ├── reports/route.ts
│   │       └── exceptions/route.ts
│   ├── components/
│   │   └── dashboard/
│   │       ├── KPIBands.tsx
│   │       ├── StateBuckets.tsx
│   │       ├── CustodianDistribution.tsx
│   │       ├── ValidatorTable.tsx
│   │       └── ExceptionSummary.tsx
│   ├── services/
│   │   ├── rollup.ts
│   │   ├── reconciliation.ts
│   │   ├── exceptions.ts
│   │   └── export/
│   │       ├── csv.ts
│   │       └── pdf.ts
│   ├── domain/
│   │   └── types.ts
│   └── db/
│       ├── schema.ts
│       └── client.ts
├── tests/
│   ├── db/
│   ├── services/
│   ├── api/
│   ├── components/
│   └── e2e/
├── drizzle.config.ts
├── vitest.config.ts
├── playwright.config.ts
└── package.json
```

## Execution Order

1. **Phase 1**: Setup (Tasks 1.1-1.3)
2. **Phase 2**: Data Layer (Tasks 2.1-2.3)
3. **Phase 3**: APIs (Tasks 3.1-3.4)
4. **Phase 4**: UI Components (Tasks 4.1-4.5)
5. **Phase 5**: Drilldown Pages (Tasks 5.1-5.2)
6. **Phase 6**: Reporting (Tasks 6.1-6.2)
7. **Phase 7**: Exceptions (Task 7.1)
8. **Phase 8**: Integration (Tasks 8.1-8.2)

## Success Criteria

- All tests pass (unit + E2E)
- Morning check flow completes in < 3 seconds
- Report generation is deterministic
- All acceptance criteria from PRD are met
