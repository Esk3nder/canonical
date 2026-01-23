/**
 * Validator Detail API
 * GET /api/validators/:id - Returns validator detail
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { validators, operators, custodians, stakeEvents } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { calculateTrailingApy, type RewardEvent } from '@/services/rollup'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Fetch validator with operator and custodian context
    const validatorRows = await db
      .select({
        id: validators.id,
        pubkey: validators.pubkey,
        operatorId: validators.operatorId,
        operatorName: operators.name,
        custodianId: custodians.id,
        custodianName: custodians.name,
        withdrawalCredential: validators.withdrawalCredential,
        status: validators.status,
        stakeState: validators.stakeState,
        balance: validators.balance,
        effectiveBalance: validators.effectiveBalance,
        activationEpoch: validators.activationEpoch,
        exitEpoch: validators.exitEpoch,
        createdAt: validators.createdAt,
        updatedAt: validators.updatedAt,
      })
      .from(validators)
      .innerJoin(operators, eq(validators.operatorId, operators.id))
      .innerJoin(custodians, eq(operators.custodianId, custodians.id))
      .where(eq(validators.id, id))
      .limit(1)

    if (validatorRows.length === 0) {
      return NextResponse.json(
        { error: 'Validator not found' },
        { status: 404 }
      )
    }

    const validator = validatorRows[0]

    // Fetch recent events
    const eventRows = await db
      .select()
      .from(stakeEvents)
      .where(eq(stakeEvents.validatorId, id))
      .orderBy(desc(stakeEvents.timestamp))
      .limit(100)

    // Calculate rewards
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const now = new Date()

    const rewardEvents: RewardEvent[] = eventRows
      .filter((e) => e.eventType === 'reward' && e.timestamp >= thirtyDaysAgo)
      .map((e) => ({
        validatorId: e.validatorId,
        amount: BigInt(e.amount),
        timestamp: e.timestamp,
      }))

    const trailingApy30d = calculateTrailingApy(
      rewardEvents,
      BigInt(validator.balance),
      thirtyDaysAgo,
      now
    )

    // Calculate total rewards
    const rewardsTotal = eventRows
      .filter((e) => e.eventType === 'reward')
      .reduce((sum, e) => sum + BigInt(e.amount), 0n)

    // Calculate penalties
    const penalties = eventRows
      .filter((e) => e.eventType === 'penalty')
      .reduce((sum, e) => sum + BigInt(e.amount), 0n)

    // Find last activity
    const lastEvent = eventRows[0]
    const lastActivityTimestamp = lastEvent?.timestamp ?? validator.updatedAt

    return NextResponse.json({
      data: {
        id: validator.id,
        pubkey: validator.pubkey,
        operatorId: validator.operatorId,
        operatorName: validator.operatorName,
        custodianId: validator.custodianId,
        custodianName: validator.custodianName,
        withdrawalCredential: validator.withdrawalCredential,
        status: validator.status,
        stakeState: validator.stakeState,
        balance: validator.balance,
        effectiveBalance: validator.effectiveBalance,
        activationEpoch: validator.activationEpoch,
        exitEpoch: validator.exitEpoch,
        trailingApy30d,
        rewardsTotal: rewardsTotal.toString(),
        penalties: penalties.toString(),
        lastActivityTimestamp: lastActivityTimestamp.toISOString(),
        createdAt: validator.createdAt.toISOString(),
        updatedAt: validator.updatedAt.toISOString(),
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Validator API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch validator data' },
      { status: 500 }
    )
  }
}
