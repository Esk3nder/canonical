/**
 * Portfolio API
 * GET /api/portfolio - Returns portfolio summary
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { validators, operators, custodians, stakeEvents, dailySnapshots } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import {
  createPortfolioSummary,
  type ValidatorWithContext,
  type RewardEvent,
} from '@/services/rollup'
import type { StakeState } from '@/domain/types'

/**
 * Serializes bigint values to strings for JSON transport
 */
function serializePortfolioSummary(
  summary: ReturnType<typeof createPortfolioSummary>,
  change24h?: bigint
) {
  return {
    totalValue: summary.totalValue.toString(),
    change24h: change24h?.toString() ?? '0',
    trailingApy30d: summary.trailingApy30d,
    previousMonthApy: summary.previousMonthApy,
    networkBenchmarkApy: summary.networkBenchmarkApy,
    validatorCount: summary.validatorCount,
    stateBuckets: {
      deposited: summary.stateBuckets.deposited.toString(),
      entryQueue: summary.stateBuckets.entryQueue.toString(),
      active: summary.stateBuckets.active.toString(),
      exiting: summary.stateBuckets.exiting.toString(),
      withdrawable: summary.stateBuckets.withdrawable.toString(),
    },
    custodianBreakdown: summary.custodianBreakdown.map((c) => ({
      custodianId: c.custodianId,
      custodianName: c.custodianName,
      value: c.value.toString(),
      percentage: c.percentage,
      trailingApy30d: c.trailingApy30d,
      validatorCount: c.validatorCount,
      change7d: c.change7d,
      change30d: c.change30d,
    })),
    asOfTimestamp: summary.asOfTimestamp.toISOString(),
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const daysParam = searchParams.get('days')
    const windowDays: number | null = daysParam === 'all' ? null : (daysParam ? Number(daysParam) : 30)

    // Fetch all validators with their operator and custodian context
    const validatorRows = await db
      .select({
        id: validators.id,
        pubkey: validators.pubkey,
        operatorId: validators.operatorId,
        operatorName: operators.name,
        custodianId: custodians.id,
        custodianName: custodians.name,
        status: validators.status,
        stakeState: validators.stakeState,
        balance: validators.balance,
        effectiveBalance: validators.effectiveBalance,
      })
      .from(validators)
      .innerJoin(operators, eq(validators.operatorId, operators.id))
      .innerJoin(custodians, eq(operators.custodianId, custodians.id))

    // Transform to ValidatorWithContext
    const validatorsWithContext: ValidatorWithContext[] = validatorRows.map((v) => ({
      id: v.id,
      pubkey: v.pubkey,
      operatorId: v.operatorId,
      operatorName: v.operatorName,
      custodianId: v.custodianId,
      custodianName: v.custodianName,
      status: v.status,
      stakeState: v.stakeState as StakeState,
      balance: BigInt(v.balance),
      effectiveBalance: BigInt(v.effectiveBalance),
    }))

    // Fetch reward events (need 2x window for current + previous period comparison)
    let rewardDateFilter: Date | null = null
    if (windowDays !== null) {
      rewardDateFilter = new Date(Date.now() - windowDays * 2 * 24 * 60 * 60 * 1000)
    }
    const rewardRows = await db
      .select({
        validatorId: stakeEvents.validatorId,
        amount: stakeEvents.amount,
        timestamp: stakeEvents.timestamp,
      })
      .from(stakeEvents)
      .where(eq(stakeEvents.eventType, 'reward'))

    // Transform to RewardEvent and filter by date
    const rewardEvents: RewardEvent[] = rewardRows
      .filter((r) => rewardDateFilter === null || r.timestamp >= rewardDateFilter)
      .map((r) => ({
        validatorId: r.validatorId,
        amount: BigInt(r.amount),
        timestamp: r.timestamp,
      }))

    // Create portfolio summary
    const summary = createPortfolioSummary(validatorsWithContext, rewardEvents, windowDays)

    // Get the most recent snapshot for 24h change calculation
    const previousSnapshots = await db
      .select({ totalValue: dailySnapshots.totalValue })
      .from(dailySnapshots)
      .orderBy(desc(dailySnapshots.date))
      .limit(1)

    let change24h: bigint | undefined
    if (previousSnapshots.length > 0) {
      const previousValue = BigInt(previousSnapshots[0].totalValue)
      change24h = summary.totalValue - previousValue
    }

    return NextResponse.json({
      data: serializePortfolioSummary(summary, change24h),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Portfolio API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio data' },
      { status: 500 }
    )
  }
}
