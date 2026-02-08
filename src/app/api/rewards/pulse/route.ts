/**
 * Rewards Pulse API
 * GET /api/rewards/pulse - Returns real-time rewards summary for dashboard
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { stakeEvents, validators, operators, custodians } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const daysParam = searchParams.get('days')
    const windowDays: number | null = daysParam === 'all' ? null : (daysParam ? Number(daysParam) : 30)

    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const periodStart = windowDays !== null
      ? new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000)
      : null

    // Get all reward events for calculations
    const rewardEvents = await db
      .select({
        amount: stakeEvents.amount,
        timestamp: stakeEvents.timestamp,
        finalized: stakeEvents.finalized,
        custodianId: custodians.id,
        custodianName: custodians.name,
      })
      .from(stakeEvents)
      .innerJoin(validators, eq(stakeEvents.validatorId, validators.id))
      .innerJoin(operators, eq(validators.operatorId, operators.id))
      .innerJoin(custodians, eq(operators.custodianId, custodians.id))
      .where(eq(stakeEvents.eventType, 'reward'))
      .orderBy(desc(stakeEvents.timestamp))

    // Calculate claimable (finalized rewards)
    const claimableRewards = rewardEvents.filter((r) => r.finalized)
    const claimableNow = claimableRewards.reduce(
      (sum, r) => sum + BigInt(r.amount),
      0n
    )

    // Calculate 24h change for claimable (new rewards in last 24h)
    const newClaimableLast24h = claimableRewards
      .filter((r) => r.timestamp >= twentyFourHoursAgo)
      .reduce((sum, r) => sum + BigInt(r.amount), 0n)

    // Calculate accrued (unfinalized rewards)
    const accrued = rewardEvents
      .filter((r) => !r.finalized)
      .reduce((sum, r) => sum + BigInt(r.amount), 0n)

    // Calculate claimed in period (finalized rewards within selected time window)
    const claimedInPeriod = claimableRewards
      .filter((r) => periodStart === null || r.timestamp >= periodStart)
      .reduce((sum, r) => sum + BigInt(r.amount), 0n)

    // Group claimable by custodian
    const custodianMap = new Map<
      string,
      { custodianId: string; custodianName: string; amount: bigint }
    >()

    for (const reward of claimableRewards) {
      const existing = custodianMap.get(reward.custodianId)
      if (existing) {
        existing.amount += BigInt(reward.amount)
      } else {
        custodianMap.set(reward.custodianId, {
          custodianId: reward.custodianId,
          custodianName: reward.custodianName,
          amount: BigInt(reward.amount),
        })
      }
    }

    const custodianBreakdown = Array.from(custodianMap.values()).map((c) => ({
      custodianId: c.custodianId,
      custodianName: c.custodianName,
      amount: c.amount.toString(),
    }))

    return NextResponse.json({
      data: {
        claimableNow: claimableNow.toString(),
        claimable24hChange: newClaimableLast24h.toString(),
        custodianBreakdown,
        accrued: accrued.toString(),
        claimedThisMonth: claimedInPeriod.toString(),
        asOfTimestamp: now.toISOString(),
      },
    })
  } catch (error) {
    console.error('Rewards pulse API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rewards pulse data' },
      { status: 500 }
    )
  }
}
