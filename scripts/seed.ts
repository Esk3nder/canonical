import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { eq } from 'drizzle-orm'
import * as schema from '../src/db/schema'

const connectionString = process.env.POSTGRES_URL || 'postgresql://localhost:5432/canonical_staking'
const client = postgres(connectionString)
const db = drizzle(client, { schema })

async function seed() {
  console.log('Seeding database...')

  // Check if already seeded
  const existingEntity = await db.select().from(schema.entities).limit(1)
  if (existingEntity.length > 0) {
    console.log('Database already seeded, skipping...')
    await client.end()
    return
  }

  // Create entity (fund)
  const [entity] = await db.insert(schema.entities).values({
    id: 'entity-1',
    name: 'Institutional Staking Fund I',
    type: 'fund',
  }).returning()
  console.log('Created entity:', entity.name)

  // Create custodians
  const custodianData = [
    { id: 'custodian-coinbase', name: 'Coinbase Prime', description: 'Coinbase institutional custody' },
    { id: 'custodian-anchorage', name: 'Anchorage Digital', description: 'Anchorage institutional custody' },
    { id: 'custodian-bitgo', name: 'BitGo', description: 'BitGo institutional custody' },
  ]
  await db.insert(schema.custodians).values(custodianData)
  console.log('Created custodians:', custodianData.length)

  // Create operators
  const operatorData = [
    { id: 'op-figment', name: 'Figment', custodianId: 'custodian-coinbase', description: 'Figment staking operator' },
    { id: 'op-blockdaemon', name: 'Blockdaemon', custodianId: 'custodian-coinbase', description: 'Blockdaemon operator' },
    { id: 'op-staked', name: 'Staked', custodianId: 'custodian-anchorage', description: 'Staked operator' },
    { id: 'op-chorus', name: 'Chorus One', custodianId: 'custodian-bitgo', description: 'Chorus One operator' },
  ]
  await db.insert(schema.operators).values(operatorData)
  console.log('Created operators:', operatorData.length)

  // Create validators with realistic data
  const validators = []
  const statuses = ['active', 'active', 'active', 'active', 'pending', 'exited'] as const
  const stakeStates = ['active', 'active', 'active', 'deposited', 'pending_activation', 'exiting', 'withdrawable'] as const

  for (let i = 0; i < 50; i++) {
    const operatorIdx = i % operatorData.length
    const statusIdx = i % statuses.length
    const stateIdx = i % stakeStates.length

    // 32 ETH = 32000000000 gwei (stored as string)
    const baseBalance = 32000000000n
    const rewards = BigInt(Math.floor(Math.random() * 500000000)) // 0-0.5 ETH in rewards
    const balance = (baseBalance + rewards).toString()

    validators.push({
      id: `val-${i.toString().padStart(4, '0')}`,
      pubkey: `0x${Array(96).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      operatorId: operatorData[operatorIdx].id,
      entityId: entity.id,
      withdrawalCredential: `0x01${Array(62).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      status: statuses[statusIdx],
      stakeState: stakeStates[stateIdx],
      activationEpoch: 100000 + i * 100,
      balance,
      effectiveBalance: '32000000000',
    })
  }
  await db.insert(schema.validators).values(validators)
  console.log('Created validators:', validators.length)

  // Create stake events
  const events = []
  const now = new Date()

  // Build operator-to-custodian lookup
  const operatorToCustodian = new Map(
    operatorData.map((op) => [op.id, op.custodianId])
  )

  // Generate deposit/activation events for all validators (at creation time)
  let eventCounter = 0
  for (const validator of validators) {
    // Deposit event ~91 days ago
    events.push({
      id: `event-${eventCounter.toString().padStart(5, '0')}`,
      validatorId: validator.id,
      eventType: 'deposit' as const,
      amount: '32000000000',
      epoch: 100000 + eventCounter,
      slot: (100000 + eventCounter) * 32,
      timestamp: new Date(now.getTime() - 91 * 24 * 60 * 60 * 1000),
      finalized: true,
    })
    eventCounter++

    // Activation event ~90 days ago
    events.push({
      id: `event-${eventCounter.toString().padStart(5, '0')}`,
      validatorId: validator.id,
      eventType: 'activation' as const,
      amount: '0',
      epoch: 100000 + eventCounter,
      slot: (100000 + eventCounter) * 32,
      timestamp: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      finalized: true,
    })
    eventCounter++
  }

  // Generate reward events across 90 days with per-custodian variation
  for (let daysAgo = 89; daysAgo >= 0; daysAgo--) {
    const dayStart = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)

    for (const validator of validators) {
      // Only generate rewards for active-state validators
      if (validator.stakeState !== 'active') continue

      // ~60% chance of a reward event per validator per day
      if (Math.random() > 0.6) continue

      const custodianId = operatorToCustodian.get(validator.operatorId)!
      let baseReward: number

      // Per-custodian reward profiles
      if (custodianId === 'custodian-coinbase') {
        // Coinbase Prime: slight upward trend, ~3.5-4.0% APR
        baseReward = 35000000 + Math.floor(Math.random() * 10000000)
        baseReward += Math.floor((90 - daysAgo) * 50000)
      } else if (custodianId === 'custodian-anchorage') {
        // Anchorage Digital: higher volatility via sine wave, ~3.8-4.2% APR
        baseReward = 38000000 + Math.floor(Math.random() * 10000000)
        baseReward += Math.floor(Math.sin(daysAgo / 7) * 5000000)
      } else {
        // BitGo: stable, slightly lower, ~3.2-3.6% APR
        baseReward = 30000000 + Math.floor(Math.random() * 10000000)
      }

      // Dip for BitGo around days 40-50 ago
      if (custodianId === 'custodian-bitgo' && daysAgo >= 40 && daysAgo <= 50) {
        baseReward = Math.floor(baseReward * 0.6)
      }

      // Spike for Anchorage around days 20-30 ago
      if (custodianId === 'custodian-anchorage' && daysAgo >= 20 && daysAgo <= 30) {
        baseReward = Math.floor(baseReward * 1.3)
      }

      const timestamp = new Date(dayStart.getTime() + Math.floor(Math.random() * 24 * 60 * 60 * 1000))

      events.push({
        id: `event-${eventCounter.toString().padStart(5, '0')}`,
        validatorId: validator.id,
        eventType: 'reward' as const,
        amount: baseReward.toString(),
        epoch: 100000 + eventCounter,
        slot: (100000 + eventCounter) * 32,
        timestamp,
        finalized: true,
      })
      eventCounter++
    }
  }

  // Add additional reward events for rewards pulse demo
  // Claimable rewards (finalized) - realistic amounts for 3-4% APY (in gwei)
  // ~0.09 ETH/month per validator at 3.5% APY on 32 ETH
  const claimableRewards = [
    { validatorIdx: 0, amount: '90000000', hoursAgo: 2 }, // 0.09 ETH - Figment (Coinbase)
    { validatorIdx: 1, amount: '85000000', hoursAgo: 5 }, // 0.085 ETH - Blockdaemon (Coinbase)
    { validatorIdx: 2, amount: '88000000', hoursAgo: 12 }, // 0.088 ETH - Staked (Anchorage)
    { validatorIdx: 3, amount: '92000000', hoursAgo: 1 }, // 0.092 ETH - Chorus (BitGo)
  ]

  for (let i = 0; i < claimableRewards.length; i++) {
    const { validatorIdx, amount, hoursAgo } = claimableRewards[i]
    const timestamp = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000)
    events.push({
      id: `event-claim-${i.toString().padStart(5, '0')}`,
      validatorId: validators[validatorIdx].id,
      eventType: 'reward' as const,
      amount,
      epoch: 200000 + i,
      slot: (200000 + i) * 32,
      timestamp,
      finalized: true,
    })
  }

  // Accrued rewards (unfinalized/pending) - in gwei
  // Pending rewards accumulating over a few days
  const accruedRewards = [
    { validatorIdx: 0, amount: '45000000', hoursAgo: 0 }, // 0.045 ETH pending
    { validatorIdx: 1, amount: '42000000', hoursAgo: 0 }, // 0.042 ETH pending
    { validatorIdx: 2, amount: '48000000', hoursAgo: 0 }, // 0.048 ETH pending
  ]

  for (let i = 0; i < accruedRewards.length; i++) {
    const { validatorIdx, amount, hoursAgo } = accruedRewards[i]
    const timestamp = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000)
    events.push({
      id: `event-accrued-${i.toString().padStart(5, '0')}`,
      validatorId: validators[validatorIdx].id,
      eventType: 'reward' as const,
      amount,
      epoch: 300000 + i,
      slot: (300000 + i) * 32,
      timestamp,
      finalized: false,
    })
  }

  // Claimed this month rewards (finalized, within current month) - in gwei
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const claimedThisMonth = [
    { validatorIdx: 0, amount: '95000000', daysAgo: 5 }, // 0.095 ETH
    { validatorIdx: 1, amount: '88000000', daysAgo: 10 }, // 0.088 ETH
    { validatorIdx: 2, amount: '92000000', daysAgo: 15 }, // 0.092 ETH
  ]

  for (let i = 0; i < claimedThisMonth.length; i++) {
    const { validatorIdx, amount, daysAgo } = claimedThisMonth[i]
    const timestamp = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    // Only add if within current month
    if (timestamp >= startOfMonth) {
      events.push({
        id: `event-claimed-${i.toString().padStart(5, '0')}`,
        validatorId: validators[validatorIdx].id,
        eventType: 'reward' as const,
        amount,
        epoch: 400000 + i,
        slot: (400000 + i) * 32,
        timestamp,
        finalized: true,
      })
    }
  }

  await db.insert(schema.stakeEvents).values(events)
  console.log('Created stake events:', events.length)

  // Create a few exceptions
  const exceptions = [
    {
      id: 'exc-001',
      type: 'rewards_anomaly' as const,
      status: 'new' as const,
      title: 'Rewards below expected threshold',
      description: 'Validator val-0012 has earned 15% less rewards than expected over the past 7 days.',
      severity: 'medium' as const,
      evidenceLinks: [
        { type: 'validator' as const, id: 'val-0012', label: 'Validator 0012' }
      ],
    },
    {
      id: 'exc-002',
      type: 'in_transit_stuck' as const,
      status: 'investigating' as const,
      title: 'Deposit stuck in transit',
      description: 'Validator val-0025 deposit has been in transit for 5 days.',
      severity: 'high' as const,
      evidenceLinks: [
        { type: 'validator' as const, id: 'val-0025', label: 'Validator 0025' }
      ],
    },
  ]
  await db.insert(schema.exceptions).values(exceptions)
  console.log('Created exceptions:', exceptions.length)

  // Create daily snapshot
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const dateStr = yesterday.toISOString().split('T')[0]

  // Calculate totals (50 validators * ~32 ETH each)
  const totalValue = (50n * 32000000000n + 10000000000n).toString() // ~1600 ETH + rewards

  await db.insert(schema.dailySnapshots).values({
    id: `snapshot-${dateStr}`,
    date: dateStr,
    entityId: entity.id,
    totalValue,
    activeStake: (38n * 32000000000n).toString(),
    inTransitStake: (7n * 32000000000n).toString(), // deposited + entryQueue
    rewardsAccrued: '10000000000',
    exitingStake: (5n * 32000000000n).toString(), // exiting + withdrawable
    validatorCount: 50,
    trailingApy30d: 4.2,
  })
  console.log('Created daily snapshot')

  console.log('Seeding complete!')
  await client.end()
}

seed().catch((err) => {
  console.error('Seeding failed:', err)
  process.exit(1)
})
