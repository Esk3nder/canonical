/**
 * APR History API
 * GET /api/portfolio/apr-history - Returns rolling 7-day APR per custodian per day
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { stakeEvents, validators, operators, custodians } from '@/db/schema'
import { eq, gte, and } from 'drizzle-orm'
import { calculateTrailingApy, type RewardEvent } from '@/services/rollup'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const days = Math.min(parseInt(searchParams.get('days') || '90', 10), 180)
    const windowDays = 7

    // Need events going back (days + windowDays) for rolling window on earliest date
    const lookbackMs = (days + windowDays) * 24 * 60 * 60 * 1000
    const cutoffDate = new Date(Date.now() - lookbackMs)

    // Fetch validators with custodian context
    const validatorRows = await db
      .select({
        id: validators.id,
        operatorId: validators.operatorId,
        custodianId: custodians.id,
        custodianName: custodians.name,
        balance: validators.balance,
      })
      .from(validators)
      .innerJoin(operators, eq(validators.operatorId, operators.id))
      .innerJoin(custodians, eq(operators.custodianId, custodians.id))

    // Fetch reward events in the lookback period
    const rewardRows = await db
      .select({
        validatorId: stakeEvents.validatorId,
        amount: stakeEvents.amount,
        timestamp: stakeEvents.timestamp,
      })
      .from(stakeEvents)
      .where(
        and(
          eq(stakeEvents.eventType, 'reward'),
          gte(stakeEvents.timestamp, cutoffDate)
        )
      )

    // Build validator-to-custodian lookup and custodian balances
    const validatorToCustodian = new Map<string, string>()
    const custodianBalances = new Map<string, bigint>()
    const custodianNames = new Map<string, string>()

    for (const v of validatorRows) {
      validatorToCustodian.set(v.id, v.custodianId)
      custodianNames.set(v.custodianId, v.custodianName)
      const existing = custodianBalances.get(v.custodianId) ?? 0n
      custodianBalances.set(v.custodianId, existing + BigInt(v.balance))
    }

    // Group reward events by custodian
    const rewardsByCustodian = new Map<string, RewardEvent[]>()
    for (const r of rewardRows) {
      const custodianId = validatorToCustodian.get(r.validatorId)
      if (!custodianId) continue
      const existing = rewardsByCustodian.get(custodianId) ?? []
      existing.push({
        validatorId: r.validatorId,
        amount: BigInt(r.amount),
        timestamp: r.timestamp,
      })
      rewardsByCustodian.set(custodianId, existing)
    }

    // Compute rolling 7-day APR for each day, for each custodian
    const series: Array<Record<string, number | string>> = []
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    const custodianIds = Array.from(custodianNames.keys())

    for (let d = days - 1; d >= 0; d--) {
      const windowEnd = new Date(today.getTime() - d * 24 * 60 * 60 * 1000)
      windowEnd.setHours(23, 59, 59, 999)
      const windowStart = new Date(
        windowEnd.getTime() - windowDays * 24 * 60 * 60 * 1000
      )

      const dateStr = windowEnd.toISOString().split('T')[0]
      const point: Record<string, number | string> = { date: dateStr }

      for (const custodianId of custodianIds) {
        const rewards = rewardsByCustodian.get(custodianId) ?? []
        const principal = custodianBalances.get(custodianId) ?? 0n
        const apr = calculateTrailingApy(rewards, principal, windowStart, windowEnd)
        point[custodianId] = Math.round(apr * 10000) / 10000 // 4 decimal places
      }

      series.push(point)
    }

    // Build custodian list for chart legend
    const custodianList = custodianIds.map((id) => ({
      id,
      name: custodianNames.get(id)!,
    }))

    return NextResponse.json({
      data: { series, custodians: custodianList, windowDays },
    })
  } catch (error) {
    console.error('APR History API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch APR history' },
      { status: 500 }
    )
  }
}
