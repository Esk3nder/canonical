# Blockengine Institutional Staking Portfolio Overview - Spec

## Tech Stack
- **Frontend**: TypeScript + Next.js 14 (App Router)
- **Database**: SQLite (via better-sqlite3 or Drizzle ORM)
- **Styling**: Tailwind CSS
- **Charts**: Recharts or Tremor
- **Testing**: Vitest + Playwright
- **Development**: TDD approach

## Summary

Institutional staking portfolio dashboard with:
1. Fast "is everything OK?" morning check visibility
2. Clear state buckets (active/in-transit/rewards/exit)
3. Custodian/operator breakdown with comparability
4. Validator-level drilldown tied to on-chain evidence

## Core Components

### A) Portfolio Overview Dashboard

**Top Bands (Above the Fold)**
- Total portfolio value
- Trailing APR/APY (30-day)
- Validator count

**State Buckets (Above the Fold)**
- Active stake
- In-transit (pending activation)
- Rewards (unclaimed/claimable)
- Exit/exiting stake

**Custodian/Operator Distribution (Above the Fold)**
- Per-custodian value and % allocation
- Per-custodian trailing APR/APY
- 7d/30d change indicators
- Comparison table (no hover required)

**Validator Performance (Below the Fold)**
- Validator list/table
- Status/state per validator
- Performance indicators
- Drilldown links

### B) Staking Sub-Ledger (Data Layer)

**Identity & Mapping**
- Entity → Custodian → Validator → Withdrawal credential mapping
- Configuration change tracking over time

**Event Ingestion**
- Stake state transitions
- Rewards accrual and withdrawals
- Penalties/abnormal events
- Finality-aware processing (provisional → finalized)

**Deterministic Rollups**
- Validator → Custodian → Product → Entity rollups
- Time-bucketed outputs (daily, monthly)

**Reconciliation**
- Internal vs external statement reconciliation
- Variance tracking with evidence

### C) Reporting / Export Pack

**Monthly Statement Pack**
- Portfolio/product summary
- Validator-level schedule
- Custodian/operator breakdown
- Methodology/version identifier
- Evidence appendix

**Exports**
- CSV export
- PDF export
- Clean primitives for downstream systems

### D) Exceptions System

**Exception Types**
- Material portfolio value change
- Validator count shift
- In-transit stuck/delayed
- Rewards anomaly
- Custodian performance divergence

**Workflow**
- Exception queue (new/investigating/resolved)
- Evidence links
- Exportable exception report

## User Flows

1. **Morning Check**: Land → Read KPIs → Check buckets → Drill if needed
2. **Custodian Comparison**: Scan allocation → Identify issues → Drill down
3. **Monthly Close**: Select period → Generate pack → Review → Export
4. **Prove It**: Question number → Drill to validator → Export evidence

## Acceptance Criteria

1. Above-fold: portfolio value, APR/APY, validator count visible on load
2. Above-fold: state bucket totals visible
3. Custodian comparison without hover
4. Drilldown: headline → custodian → validator → evidence
5. Monthly statement pack generation (PDF/CSV)
6. Reproducible outputs (same inputs = same outputs)
7. Exception detection with evidence links

## Non-Functional Requirements

- Fast load time for morning check
- Reproducible reports (versioned methodology)
- Audit trail for config changes
- Clear definitions for buckets/states
- Role-based access control
- Graceful handling of missing data
