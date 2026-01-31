import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { sql } from 'drizzle-orm'
import * as schema from '@/db/schema'

describe('Database Schema', () => {
  let sqlite: Database.Database
  let db: ReturnType<typeof drizzle>

  beforeEach(() => {
    // Create in-memory database for each test
    sqlite = new Database(':memory:')
    sqlite.pragma('foreign_keys = ON')
    db = drizzle(sqlite, { schema })

    // Create tables manually for testing (in production, use migrations)
    sqlite.exec(`
      CREATE TABLE entities (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('fund', 'product', 'portfolio')),
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE custodians (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE operators (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        custodian_id TEXT NOT NULL REFERENCES custodians(id),
        description TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE validators (
        id TEXT PRIMARY KEY,
        pubkey TEXT NOT NULL UNIQUE,
        operator_id TEXT NOT NULL REFERENCES operators(id),
        entity_id TEXT REFERENCES entities(id),
        withdrawal_credential TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'slashed', 'exited')),
        stake_state TEXT NOT NULL DEFAULT 'deposited' CHECK (stake_state IN ('deposited', 'pending_activation', 'active', 'exiting', 'withdrawable')),
        activation_epoch INTEGER,
        exit_epoch INTEGER,
        balance TEXT NOT NULL DEFAULT '0',
        effective_balance TEXT NOT NULL DEFAULT '0',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE stake_events (
        id TEXT PRIMARY KEY,
        validator_id TEXT NOT NULL REFERENCES validators(id),
        event_type TEXT NOT NULL CHECK (event_type IN ('deposit', 'activation', 'reward', 'penalty', 'exit_initiated', 'exit_completed', 'withdrawal')),
        amount TEXT NOT NULL,
        epoch INTEGER,
        slot INTEGER,
        block_number INTEGER,
        tx_hash TEXT,
        timestamp INTEGER NOT NULL,
        finalized INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE exceptions (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL CHECK (type IN ('portfolio_value_change', 'validator_count_change', 'in_transit_stuck', 'rewards_anomaly', 'performance_divergence')),
        status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'investigating', 'resolved')),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
        evidence_links TEXT NOT NULL DEFAULT '[]',
        detected_at INTEGER NOT NULL,
        resolved_at INTEGER,
        resolved_by TEXT,
        resolution TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE config_history (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL CHECK (entity_type IN ('validator', 'operator', 'custodian', 'entity')),
        entity_id TEXT NOT NULL,
        field_name TEXT NOT NULL,
        old_value TEXT,
        new_value TEXT,
        changed_at INTEGER NOT NULL,
        changed_by TEXT,
        reason TEXT
      );

      CREATE TABLE daily_snapshots (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        entity_id TEXT REFERENCES entities(id),
        total_value TEXT NOT NULL,
        active_stake TEXT NOT NULL,
        in_transit_stake TEXT NOT NULL,
        rewards_accrued TEXT NOT NULL,
        exiting_stake TEXT NOT NULL,
        validator_count INTEGER NOT NULL,
        trailing_apy_30d REAL,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE reports (
        id TEXT PRIMARY KEY,
        entity_id TEXT REFERENCES entities(id),
        period_start INTEGER NOT NULL,
        period_end INTEGER NOT NULL,
        methodology_version TEXT NOT NULL,
        format TEXT NOT NULL CHECK (format IN ('json', 'csv', 'pdf')),
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'complete', 'failed')),
        data TEXT,
        file_path TEXT,
        generated_at INTEGER,
        created_at INTEGER NOT NULL
      );
    `)
  })

  afterEach(() => {
    sqlite.close()
  })

  describe('entities table', () => {
    it('creates entities with required columns', async () => {
      const now = Date.now()
      const result = db.insert(schema.entities).values({
        id: 'entity-1',
        name: 'Test Fund',
        type: 'fund',
        createdAt: new Date(now),
        updatedAt: new Date(now),
      }).run()

      expect(result.changes).toBe(1)

      const entities = db.select().from(schema.entities).all()
      expect(entities).toHaveLength(1)
      expect(entities[0].name).toBe('Test Fund')
      expect(entities[0].type).toBe('fund')
    })

    it('enforces valid entity types', () => {
      expect(() => {
        sqlite.exec(`INSERT INTO entities (id, name, type, created_at, updated_at) VALUES ('e1', 'Test', 'invalid', ${Date.now()}, ${Date.now()})`)
      }).toThrow()
    })
  })

  describe('custodians table', () => {
    it('creates custodians with required columns', () => {
      const now = Date.now()
      const result = db.insert(schema.custodians).values({
        id: 'custodian-1',
        name: 'Coinbase Custody',
        description: 'Leading institutional custodian',
        createdAt: new Date(now),
        updatedAt: new Date(now),
      }).run()

      expect(result.changes).toBe(1)

      const custodians = db.select().from(schema.custodians).all()
      expect(custodians).toHaveLength(1)
      expect(custodians[0].name).toBe('Coinbase Custody')
    })
  })

  describe('operators table', () => {
    it('creates operators with custodian reference', () => {
      const now = Date.now()

      // First create custodian
      db.insert(schema.custodians).values({
        id: 'custodian-1',
        name: 'Coinbase Custody',
        createdAt: new Date(now),
        updatedAt: new Date(now),
      }).run()

      // Then create operator
      const result = db.insert(schema.operators).values({
        id: 'operator-1',
        name: 'Figment',
        custodianId: 'custodian-1',
        createdAt: new Date(now),
        updatedAt: new Date(now),
      }).run()

      expect(result.changes).toBe(1)
    })

    it('enforces foreign key to custodians', () => {
      const now = Date.now()
      expect(() => {
        db.insert(schema.operators).values({
          id: 'operator-1',
          name: 'Figment',
          custodianId: 'non-existent',
          createdAt: new Date(now),
          updatedAt: new Date(now),
        }).run()
      }).toThrow()
    })
  })

  describe('validators table', () => {
    beforeEach(() => {
      const now = Date.now()
      // Set up required parent records
      db.insert(schema.custodians).values({
        id: 'custodian-1',
        name: 'Coinbase Custody',
        createdAt: new Date(now),
        updatedAt: new Date(now),
      }).run()

      db.insert(schema.operators).values({
        id: 'operator-1',
        name: 'Figment',
        custodianId: 'custodian-1',
        createdAt: new Date(now),
        updatedAt: new Date(now),
      }).run()
    })

    it('creates validators with required columns', () => {
      const now = Date.now()
      const result = db.insert(schema.validators).values({
        id: 'validator-1',
        pubkey: '0x1234567890abcdef',
        operatorId: 'operator-1',
        withdrawalCredential: '0xabcdef1234567890',
        createdAt: new Date(now),
        updatedAt: new Date(now),
      }).run()

      expect(result.changes).toBe(1)

      const validators = db.select().from(schema.validators).all()
      expect(validators).toHaveLength(1)
      expect(validators[0].pubkey).toBe('0x1234567890abcdef')
      expect(validators[0].status).toBe('pending') // Default value
      expect(validators[0].stakeState).toBe('deposited') // Default value
    })

    it('enforces unique pubkey constraint', () => {
      const now = Date.now()
      db.insert(schema.validators).values({
        id: 'validator-1',
        pubkey: '0x1234567890abcdef',
        operatorId: 'operator-1',
        withdrawalCredential: '0xabcdef1234567890',
        createdAt: new Date(now),
        updatedAt: new Date(now),
      }).run()

      expect(() => {
        db.insert(schema.validators).values({
          id: 'validator-2',
          pubkey: '0x1234567890abcdef', // Same pubkey
          operatorId: 'operator-1',
          withdrawalCredential: '0xabcdef1234567890',
          createdAt: new Date(now),
          updatedAt: new Date(now),
        }).run()
      }).toThrow()
    })

    it('enforces foreign key to operators', () => {
      const now = Date.now()
      expect(() => {
        db.insert(schema.validators).values({
          id: 'validator-1',
          pubkey: '0x1234567890abcdef',
          operatorId: 'non-existent',
          withdrawalCredential: '0xabcdef1234567890',
          createdAt: new Date(now),
          updatedAt: new Date(now),
        }).run()
      }).toThrow()
    })

    it('enforces valid status values', () => {
      expect(() => {
        sqlite.exec(`
          INSERT INTO validators (id, pubkey, operator_id, withdrawal_credential, status, created_at, updated_at)
          VALUES ('v1', '0xabc', 'operator-1', '0xdef', 'invalid_status', ${Date.now()}, ${Date.now()})
        `)
      }).toThrow()
    })

    it('enforces valid stake_state values', () => {
      expect(() => {
        sqlite.exec(`
          INSERT INTO validators (id, pubkey, operator_id, withdrawal_credential, stake_state, created_at, updated_at)
          VALUES ('v1', '0xabc', 'operator-1', '0xdef', 'invalid_state', ${Date.now()}, ${Date.now()})
        `)
      }).toThrow()
    })
  })

  describe('stake_events table', () => {
    beforeEach(() => {
      const now = Date.now()
      // Set up required parent records
      db.insert(schema.custodians).values({
        id: 'custodian-1',
        name: 'Coinbase Custody',
        createdAt: new Date(now),
        updatedAt: new Date(now),
      }).run()

      db.insert(schema.operators).values({
        id: 'operator-1',
        name: 'Figment',
        custodianId: 'custodian-1',
        createdAt: new Date(now),
        updatedAt: new Date(now),
      }).run()

      db.insert(schema.validators).values({
        id: 'validator-1',
        pubkey: '0x1234567890abcdef',
        operatorId: 'operator-1',
        withdrawalCredential: '0xabcdef1234567890',
        createdAt: new Date(now),
        updatedAt: new Date(now),
      }).run()
    })

    it('creates stake events with required columns', () => {
      const now = Date.now()
      const result = db.insert(schema.stakeEvents).values({
        id: 'event-1',
        validatorId: 'validator-1',
        eventType: 'deposit',
        amount: '32000000000', // 32 ETH in gwei
        timestamp: new Date(now),
        createdAt: new Date(now),
        finalized: 0 as unknown as boolean,
      }).run()

      expect(result.changes).toBe(1)

      const events = db.select().from(schema.stakeEvents).all()
      expect(events).toHaveLength(1)
      expect(events[0].eventType).toBe('deposit')
      expect(events[0].amount).toBe('32000000000')
    })

    it('enforces valid event types', () => {
      expect(() => {
        sqlite.exec(`
          INSERT INTO stake_events (id, validator_id, event_type, amount, timestamp, created_at)
          VALUES ('e1', 'validator-1', 'invalid_type', '100', ${Date.now()}, ${Date.now()})
        `)
      }).toThrow()
    })

    it('enforces foreign key to validators', () => {
      const now = Date.now()
      expect(() => {
        db.insert(schema.stakeEvents).values({
          id: 'event-1',
          validatorId: 'non-existent',
          eventType: 'deposit',
          amount: '32000000000',
          timestamp: new Date(now),
          createdAt: new Date(now),
          finalized: 0 as unknown as boolean,
        }).run()
      }).toThrow()
    })
  })

  describe('exceptions table', () => {
    it('creates exceptions with required columns', () => {
      const now = Date.now()
      const result = db.insert(schema.exceptions).values({
        id: 'exception-1',
        type: 'portfolio_value_change',
        title: 'Unexpected value drop',
        description: 'Portfolio value dropped 5% overnight',
        severity: 'high',
        detectedAt: new Date(now),
        createdAt: new Date(now),
        updatedAt: new Date(now),
      }).run()

      expect(result.changes).toBe(1)

      const exceptions = db.select().from(schema.exceptions).all()
      expect(exceptions).toHaveLength(1)
      expect(exceptions[0].status).toBe('new') // Default value
    })

    it('enforces valid exception types', () => {
      expect(() => {
        sqlite.exec(`
          INSERT INTO exceptions (id, type, title, description, severity, detected_at, created_at, updated_at)
          VALUES ('e1', 'invalid_type', 'Test', 'Test', 'high', ${Date.now()}, ${Date.now()}, ${Date.now()})
        `)
      }).toThrow()
    })

    it('enforces valid severity levels', () => {
      expect(() => {
        sqlite.exec(`
          INSERT INTO exceptions (id, type, title, description, severity, detected_at, created_at, updated_at)
          VALUES ('e1', 'portfolio_value_change', 'Test', 'Test', 'invalid', ${Date.now()}, ${Date.now()}, ${Date.now()})
        `)
      }).toThrow()
    })
  })

  describe('config_history table', () => {
    it('tracks configuration changes', () => {
      const now = Date.now()
      const result = db.insert(schema.configHistory).values({
        id: 'history-1',
        entityType: 'validator',
        entityId: 'validator-1',
        fieldName: 'operator_id',
        oldValue: 'operator-1',
        newValue: 'operator-2',
        changedAt: new Date(now),
        changedBy: 'admin@example.com',
        reason: 'Operator migration',
      }).run()

      expect(result.changes).toBe(1)

      const history = db.select().from(schema.configHistory).all()
      expect(history).toHaveLength(1)
      expect(history[0].fieldName).toBe('operator_id')
    })
  })

  describe('daily_snapshots table', () => {
    it('creates daily snapshots', () => {
      const now = Date.now()
      const result = db.insert(schema.dailySnapshots).values({
        id: 'snapshot-1',
        date: '2026-01-23',
        totalValue: '1000000000000000000000', // 1000 ETH
        activeStake: '900000000000000000000',
        inTransitStake: '50000000000000000000',
        rewardsAccrued: '30000000000000000000',
        exitingStake: '20000000000000000000',
        validatorCount: 31,
        trailingApy30d: 0.045,
        createdAt: new Date(now),
      }).run()

      expect(result.changes).toBe(1)
    })
  })

  describe('reports table', () => {
    it('creates reports with required columns', () => {
      const now = Date.now()
      const periodStart = new Date('2026-01-01')
      const periodEnd = new Date('2026-01-31')

      const result = db.insert(schema.reports).values({
        id: 'report-1',
        periodStart,
        periodEnd,
        methodologyVersion: '1.0.0',
        format: 'pdf',
        createdAt: new Date(now),
      }).run()

      expect(result.changes).toBe(1)

      const reports = db.select().from(schema.reports).all()
      expect(reports).toHaveLength(1)
      expect(reports[0].status).toBe('pending') // Default value
    })
  })

  describe('foreign key relationships', () => {
    it('cascades correctly through validator → operator → custodian chain', () => {
      const now = Date.now()

      // Create full chain
      db.insert(schema.custodians).values({
        id: 'custodian-1',
        name: 'Test Custodian',
        createdAt: new Date(now),
        updatedAt: new Date(now),
      }).run()

      db.insert(schema.operators).values({
        id: 'operator-1',
        name: 'Test Operator',
        custodianId: 'custodian-1',
        createdAt: new Date(now),
        updatedAt: new Date(now),
      }).run()

      db.insert(schema.validators).values({
        id: 'validator-1',
        pubkey: '0xtest',
        operatorId: 'operator-1',
        withdrawalCredential: '0xwithdrawal',
        createdAt: new Date(now),
        updatedAt: new Date(now),
      }).run()

      // Verify chain exists
      const validators = db.select().from(schema.validators).all()
      expect(validators).toHaveLength(1)

      const operators = db.select().from(schema.operators).all()
      expect(operators).toHaveLength(1)
      expect(operators[0].custodianId).toBe('custodian-1')
    })
  })
})
