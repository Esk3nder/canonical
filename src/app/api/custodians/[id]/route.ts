/**
 * Custodian Detail API
 * GET /api/custodians/:id - Returns custodian detail with validators
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { custodians, operators, validators, stakeEvents } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { calculateTrailingApy, type RewardEvent } from '@/services/rollup'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Fetch custodian
    const custodianRows = await db
      .select()
      .from(custodians)
      .where(eq(custodians.id, id))
      .limit(1)

    if (custodianRows.length === 0) {
      return NextResponse.json(
        { error: 'Custodian not found' },
        { status: 404 }
      )
    }

    const custodian = custodianRows[0]

    // Fetch operators for this custodian
    const operatorRows = await db
      .select()
      .from(operators)
      .where(eq(operators.custodianId, id))

    // Fetch validators for this custodian (via operators)
    const operatorIds = operatorRows.map((o) => o.id)

    let validatorRows: Array<{
      id: string
      pubkey: string
      operatorId: string
      status: string
      stakeState: string
      balance: string
      effectiveBalance: string
    }> = []

    if (operatorIds.length > 0) {
      // Query validators for each operator
      for (const opId of operatorIds) {
        const vRows = await db
          .select({
            id: validators.id,
            pubkey: validators.pubkey,
            operatorId: validators.operatorId,
            status: validators.status,
            stakeState: validators.stakeState,
            balance: validators.balance,
            effectiveBalance: validators.effectiveBalance,
          })
          .from(validators)
          .where(eq(validators.operatorId, opId))

        validatorRows.push(...vRows)
      }
    }

    // Calculate total value
    const totalValue = validatorRows.reduce(
      (sum, v) => sum + BigInt(v.balance),
      0n
    )

    // Calculate APY from rewards
    const validatorIds = validatorRows.map((v) => v.id)
    let rewardEvents: RewardEvent[] = []

    if (validatorIds.length > 0) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

      for (const vId of validatorIds) {
        const events = await db
          .select({
            validatorId: stakeEvents.validatorId,
            amount: stakeEvents.amount,
            timestamp: stakeEvents.timestamp,
          })
          .from(stakeEvents)
          .where(eq(stakeEvents.validatorId, vId))

        rewardEvents.push(
          ...events
            .filter((e) => e.timestamp >= thirtyDaysAgo)
            .map((e) => ({
              validatorId: e.validatorId,
              amount: BigInt(e.amount),
              timestamp: e.timestamp,
            }))
        )
      }
    }

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const trailingApy30d = calculateTrailingApy(
      rewardEvents,
      totalValue,
      thirtyDaysAgo,
      now
    )

    // Build operator summaries
    const operatorSummaries = operatorRows.map((op) => ({
      id: op.id,
      name: op.name,
      description: op.description,
      validatorCount: validatorRows.filter((v) => v.operatorId === op.id).length,
    }))

    return NextResponse.json({
      data: {
        id: custodian.id,
        name: custodian.name,
        description: custodian.description,
        totalValue: totalValue.toString(),
        validatorCount: validatorRows.length,
        trailingApy30d,
        operators: operatorSummaries,
        validators: validatorRows.slice(0, 100).map((v) => ({
          id: v.id,
          pubkey: v.pubkey,
          status: v.status,
          stakeState: v.stakeState,
          balance: v.balance,
        })),
        createdAt: custodian.createdAt.toISOString(),
        updatedAt: custodian.updatedAt.toISOString(),
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Custodian API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch custodian data' },
      { status: 500 }
    )
  }
}
