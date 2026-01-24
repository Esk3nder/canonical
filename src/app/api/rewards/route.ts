/**
 * Rewards API
 * GET /api/rewards - Returns paginated list of reward events
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { stakeEvents, validators, operators, custodians } from '@/db/schema'
import { eq, desc, and, gte, lte } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const validatorId = searchParams.get('validatorId')
    const custodianId = searchParams.get('custodianId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build query conditions
    const conditions = [eq(stakeEvents.eventType, 'reward')]

    if (validatorId) {
      conditions.push(eq(stakeEvents.validatorId, validatorId))
    }

    if (startDate) {
      conditions.push(gte(stakeEvents.timestamp, new Date(startDate)))
    }

    if (endDate) {
      conditions.push(lte(stakeEvents.timestamp, new Date(endDate)))
    }

    // Fetch reward events with validator context
    const rewardRows = await db
      .select({
        id: stakeEvents.id,
        validatorId: stakeEvents.validatorId,
        validatorPubkey: validators.pubkey,
        operatorName: operators.name,
        custodianId: custodians.id,
        custodianName: custodians.name,
        amount: stakeEvents.amount,
        epoch: stakeEvents.epoch,
        timestamp: stakeEvents.timestamp,
        txHash: stakeEvents.txHash,
        finalized: stakeEvents.finalized,
      })
      .from(stakeEvents)
      .innerJoin(validators, eq(stakeEvents.validatorId, validators.id))
      .innerJoin(operators, eq(validators.operatorId, operators.id))
      .innerJoin(custodians, eq(operators.custodianId, custodians.id))
      .where(and(...conditions))
      .orderBy(desc(stakeEvents.timestamp))
      .limit(pageSize)
      .offset((page - 1) * pageSize)

    // Filter by custodian if specified (after join)
    const filteredRows = custodianId
      ? rewardRows.filter((r) => r.custodianId === custodianId)
      : rewardRows

    // Get total count for pagination
    const allRewards = await db
      .select({ id: stakeEvents.id })
      .from(stakeEvents)
      .where(and(...conditions))

    // Calculate summary stats
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const allRewardEvents = await db
      .select({
        amount: stakeEvents.amount,
        timestamp: stakeEvents.timestamp,
      })
      .from(stakeEvents)
      .where(eq(stakeEvents.eventType, 'reward'))

    const total30d = allRewardEvents
      .filter((r) => r.timestamp >= thirtyDaysAgo)
      .reduce((sum, r) => sum + BigInt(r.amount), 0n)

    const total7d = allRewardEvents
      .filter((r) => r.timestamp >= sevenDaysAgo)
      .reduce((sum, r) => sum + BigInt(r.amount), 0n)

    const totalAllTime = allRewardEvents.reduce(
      (sum, r) => sum + BigInt(r.amount),
      0n
    )

    return NextResponse.json({
      data: filteredRows.map((r) => ({
        id: r.id,
        validatorId: r.validatorId,
        validatorPubkey: r.validatorPubkey,
        operatorName: r.operatorName,
        custodianId: r.custodianId,
        custodianName: r.custodianName,
        amount: r.amount,
        epoch: r.epoch,
        timestamp: r.timestamp.toISOString(),
        txHash: r.txHash,
        finalized: r.finalized,
      })),
      total: allRewards.length,
      page,
      pageSize,
      summary: {
        total7d: total7d.toString(),
        total30d: total30d.toString(),
        totalAllTime: totalAllTime.toString(),
        eventCount: allRewardEvents.length,
      },
    })
  } catch (error) {
    console.error('Rewards API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rewards data' },
      { status: 500 }
    )
  }
}
