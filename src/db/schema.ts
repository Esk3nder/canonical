import { pgTable, text, integer, real, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ============================================================================
// Entities (Institutional clients / funds / products)
// ============================================================================

export const entities = pgTable('entities', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type', { enum: ['fund', 'product', 'portfolio'] }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ============================================================================
// Custodians (Coinbase, Anchorage, etc.)
// ============================================================================

export const custodians = pgTable('custodians', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ============================================================================
// Operators (Staking operators under custodians)
// ============================================================================

export const operators = pgTable('operators', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  custodianId: text('custodian_id').notNull().references(() => custodians.id),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ============================================================================
// Validators
// ============================================================================

export const validators = pgTable('validators', {
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
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ============================================================================
// Stake Events (deposits, rewards, withdrawals, etc.)
// ============================================================================

export const stakeEvents = pgTable('stake_events', {
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
  timestamp: timestamp('timestamp').notNull(),
  finalized: boolean('finalized').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ============================================================================
// Exceptions
// ============================================================================

export const exceptions = pgTable('exceptions', {
  id: text('id').primaryKey(),
  type: text('type', {
    enum: ['portfolio_value_change', 'validator_count_change', 'in_transit_stuck', 'rewards_anomaly', 'performance_divergence']
  }).notNull(),
  status: text('status', { enum: ['new', 'investigating', 'resolved'] }).notNull().default('new'),
  title: text('title').notNull(),
  description: text('description').notNull(),
  severity: text('severity', { enum: ['low', 'medium', 'high', 'critical'] }).notNull(),
  evidenceLinks: jsonb('evidence_links').$type<Array<{
    type: 'validator' | 'custodian' | 'event' | 'external'
    id: string
    label: string
    url?: string
  }>>().notNull().default([]),
  detectedAt: timestamp('detected_at').notNull().defaultNow(),
  resolvedAt: timestamp('resolved_at'),
  resolvedBy: text('resolved_by'),
  resolution: text('resolution'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ============================================================================
// Config History (track mapping changes over time)
// ============================================================================

export const configHistory = pgTable('config_history', {
  id: text('id').primaryKey(),
  entityType: text('entity_type', { enum: ['validator', 'operator', 'custodian', 'entity'] }).notNull(),
  entityId: text('entity_id').notNull(),
  fieldName: text('field_name').notNull(),
  oldValue: text('old_value'),
  newValue: text('new_value'),
  changedAt: timestamp('changed_at').notNull().defaultNow(),
  changedBy: text('changed_by'),
  reason: text('reason'),
})

// ============================================================================
// Daily Snapshots (for historical rollups)
// ============================================================================

export const dailySnapshots = pgTable('daily_snapshots', {
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
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ============================================================================
// Reports (generated statement packs)
// ============================================================================

export const reports = pgTable('reports', {
  id: text('id').primaryKey(),
  entityId: text('entity_id').references(() => entities.id),
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  methodologyVersion: text('methodology_version').notNull(),
  format: text('format', { enum: ['json', 'csv', 'pdf'] }).notNull(),
  status: text('status', { enum: ['pending', 'generating', 'complete', 'failed'] }).notNull().default('pending'),
  data: jsonb('data'), // Full report data as JSON
  filePath: text('file_path'),
  generatedAt: timestamp('generated_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
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
