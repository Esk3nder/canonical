import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

// ============================================================================
// Entities (Institutional clients / funds / products)
// ============================================================================

export const entities = sqliteTable('entities', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type', { enum: ['fund', 'product', 'portfolio'] }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

// ============================================================================
// Custodians (Coinbase, Anchorage, etc.)
// ============================================================================

export const custodians = sqliteTable('custodians', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

// ============================================================================
// Operators (Staking operators under custodians)
// ============================================================================

export const operators = sqliteTable('operators', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  custodianId: text('custodian_id').notNull().references(() => custodians.id),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

// ============================================================================
// Validators
// ============================================================================

export const validators = sqliteTable('validators', {
  id: text('id').primaryKey(),
  pubkey: text('pubkey').notNull().unique(),
  operatorId: text('operator_id').notNull().references(() => operators.id),
  entityId: text('entity_id').references(() => entities.id),
  withdrawalCredential: text('withdrawal_credential').notNull(),
  status: text('status', { enum: ['active', 'pending', 'slashed', 'exited'] }).notNull().default('pending'),
  stakeState: text('stake_state', { enum: ['active', 'pending_activation', 'in_transit', 'exiting', 'exited'] }).notNull().default('pending_activation'),
  activationEpoch: integer('activation_epoch'),
  exitEpoch: integer('exit_epoch'),
  balance: text('balance').notNull().default('0'), // Store as string for bigint
  effectiveBalance: text('effective_balance').notNull().default('0'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

// ============================================================================
// Stake Events (deposits, rewards, withdrawals, etc.)
// ============================================================================

export const stakeEvents = sqliteTable('stake_events', {
  id: text('id').primaryKey(),
  validatorId: text('validator_id').notNull().references(() => validators.id),
  eventType: text('event_type', {
    enum: ['deposit', 'activation', 'reward', 'penalty', 'exit_initiated', 'exit_completed', 'withdrawal']
  }).notNull(),
  amount: text('amount').notNull(), // Store as string for bigint
  epoch: integer('epoch'),
  slot: integer('slot'),
  blockNumber: integer('block_number'),
  txHash: text('tx_hash'),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  finalized: integer('finalized', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

// ============================================================================
// Exceptions
// ============================================================================

export const exceptions = sqliteTable('exceptions', {
  id: text('id').primaryKey(),
  type: text('type', {
    enum: ['portfolio_value_change', 'validator_count_change', 'in_transit_stuck', 'rewards_anomaly', 'performance_divergence']
  }).notNull(),
  status: text('status', { enum: ['new', 'investigating', 'resolved'] }).notNull().default('new'),
  title: text('title').notNull(),
  description: text('description').notNull(),
  severity: text('severity', { enum: ['low', 'medium', 'high', 'critical'] }).notNull(),
  evidenceLinks: text('evidence_links', { mode: 'json' }).$type<Array<{
    type: 'validator' | 'custodian' | 'event' | 'external'
    id: string
    label: string
    url?: string
  }>>().notNull().default([]),
  detectedAt: integer('detected_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  resolvedAt: integer('resolved_at', { mode: 'timestamp' }),
  resolvedBy: text('resolved_by'),
  resolution: text('resolution'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

// ============================================================================
// Config History (track mapping changes over time)
// ============================================================================

export const configHistory = sqliteTable('config_history', {
  id: text('id').primaryKey(),
  entityType: text('entity_type', { enum: ['validator', 'operator', 'custodian', 'entity'] }).notNull(),
  entityId: text('entity_id').notNull(),
  fieldName: text('field_name').notNull(),
  oldValue: text('old_value'),
  newValue: text('new_value'),
  changedAt: integer('changed_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  changedBy: text('changed_by'),
  reason: text('reason'),
})

// ============================================================================
// Daily Snapshots (for historical rollups)
// ============================================================================

export const dailySnapshots = sqliteTable('daily_snapshots', {
  id: text('id').primaryKey(),
  date: text('date').notNull(), // YYYY-MM-DD format
  entityId: text('entity_id').references(() => entities.id),
  totalValue: text('total_value').notNull(),
  activeStake: text('active_stake').notNull(),
  inTransitStake: text('in_transit_stake').notNull(),
  rewardsAccrued: text('rewards_accrued').notNull(),
  exitingStake: text('exiting_stake').notNull(),
  validatorCount: integer('validator_count').notNull(),
  trailingApy30d: real('trailing_apy_30d'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

// ============================================================================
// Reports (generated statement packs)
// ============================================================================

export const reports = sqliteTable('reports', {
  id: text('id').primaryKey(),
  entityId: text('entity_id').references(() => entities.id),
  periodStart: integer('period_start', { mode: 'timestamp' }).notNull(),
  periodEnd: integer('period_end', { mode: 'timestamp' }).notNull(),
  methodologyVersion: text('methodology_version').notNull(),
  format: text('format', { enum: ['json', 'csv', 'pdf'] }).notNull(),
  status: text('status', { enum: ['pending', 'generating', 'complete', 'failed'] }).notNull().default('pending'),
  data: text('data', { mode: 'json' }), // Full report data as JSON
  filePath: text('file_path'),
  generatedAt: integer('generated_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

// ============================================================================
// Relations
// ============================================================================

export const entitiesRelations = relations(entities, ({ many }) => ({
  validators: many(validators),
  dailySnapshots: many(dailySnapshots),
  reports: many(reports),
}))

export const custodiansRelations = relations(custodians, ({ many }) => ({
  operators: many(operators),
}))

export const operatorsRelations = relations(operators, ({ one, many }) => ({
  custodian: one(custodians, {
    fields: [operators.custodianId],
    references: [custodians.id],
  }),
  validators: many(validators),
}))

export const validatorsRelations = relations(validators, ({ one, many }) => ({
  operator: one(operators, {
    fields: [validators.operatorId],
    references: [operators.id],
  }),
  entity: one(entities, {
    fields: [validators.entityId],
    references: [entities.id],
  }),
  stakeEvents: many(stakeEvents),
}))

export const stakeEventsRelations = relations(stakeEvents, ({ one }) => ({
  validator: one(validators, {
    fields: [stakeEvents.validatorId],
    references: [validators.id],
  }),
}))

export const dailySnapshotsRelations = relations(dailySnapshots, ({ one }) => ({
  entity: one(entities, {
    fields: [dailySnapshots.entityId],
    references: [entities.id],
  }),
}))

export const reportsRelations = relations(reports, ({ one }) => ({
  entity: one(entities, {
    fields: [reports.entityId],
    references: [entities.id],
  }),
}))

// ============================================================================
// Type exports for use in application code
// ============================================================================

export type Entity = typeof entities.$inferSelect
export type NewEntity = typeof entities.$inferInsert

export type Custodian = typeof custodians.$inferSelect
export type NewCustodian = typeof custodians.$inferInsert

export type Operator = typeof operators.$inferSelect
export type NewOperator = typeof operators.$inferInsert

export type Validator = typeof validators.$inferSelect
export type NewValidator = typeof validators.$inferInsert

export type StakeEvent = typeof stakeEvents.$inferSelect
export type NewStakeEvent = typeof stakeEvents.$inferInsert

export type Exception = typeof exceptions.$inferSelect
export type NewException = typeof exceptions.$inferInsert

export type ConfigHistoryRecord = typeof configHistory.$inferSelect
export type NewConfigHistoryRecord = typeof configHistory.$inferInsert

export type DailySnapshot = typeof dailySnapshots.$inferSelect
export type NewDailySnapshot = typeof dailySnapshots.$inferInsert

export type Report = typeof reports.$inferSelect
export type NewReport = typeof reports.$inferInsert
