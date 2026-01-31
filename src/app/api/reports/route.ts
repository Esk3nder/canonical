/**
 * Reports API
 * GET /api/reports - List generated reports
 * POST /api/reports - Generate a new report
 */
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { db } from '@/db/client'
import { reports, validators, operators, custodians, stakeEvents } from '@/db/schema'
import { eq, desc, count } from 'drizzle-orm'
import {
  createPortfolioSummary,
  rollupValidatorsToCustodian,
  type ValidatorWithContext,
  type RewardEvent,
} from '@/services/rollup'
import type { StakeState } from '@/domain/types'

const METHODOLOGY_VERSION = '1.0.0'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse pagination
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20', 10), 100)
    const offset = (page - 1) * pageSize

    // Get total count
    const countResult = await db.select({ value: count() }).from(reports)
    const total = countResult[0]?.value || 0

    // Fetch reports
    const reportRows = await db
      .select()
      .from(reports)
      .orderBy(desc(reports.createdAt))
      .limit(pageSize)
      .offset(offset)

    const data = reportRows.map((r) => ({
      id: r.id,
      entityId: r.entityId,
      periodStart: r.periodStart.toISOString(),
      periodEnd: r.periodEnd.toISOString(),
      methodologyVersion: r.methodologyVersion,
      format: r.format,
      status: r.status,
      filePath: r.filePath,
      generatedAt: r.generatedAt?.toISOString(),
      createdAt: r.createdAt.toISOString(),
    }))

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      hasMore: offset + data.length < total,
    })
  } catch (error) {
    console.error('Reports list API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.periodStart || !body.periodEnd) {
      return NextResponse.json(
        { error: 'periodStart and periodEnd are required' },
        { status: 400 }
      )
    }

    const periodStart = new Date(body.periodStart)
    const periodEnd = new Date(body.periodEnd)
    const format = body.format || 'json'
    const entityId = body.entityId || null

    // Validate period
    if (periodStart >= periodEnd) {
      return NextResponse.json(
        { error: 'Invalid period: start date must be before end date' },
        { status: 400 }
      )
    }

    // Validate format
    if (!['json', 'csv', 'pdf'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format: must be json, csv, or pdf' },
        { status: 400 }
      )
    }

    // Create report record
    const reportId = randomUUID()

    await db.insert(reports).values({
      id: reportId,
      entityId,
      periodStart,
      periodEnd,
      methodologyVersion: METHODOLOGY_VERSION,
      format,
      status: 'generating',
      createdAt: new Date(),
    })

    // Generate report data
    try {
      // Fetch validators with context
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

      // Fetch reward events within period
      const rewardRows = await db
        .select({
          validatorId: stakeEvents.validatorId,
          amount: stakeEvents.amount,
          timestamp: stakeEvents.timestamp,
        })
        .from(stakeEvents)
        .where(eq(stakeEvents.eventType, 'reward'))

      const rewardEvents: RewardEvent[] = rewardRows
        .filter((r) => r.timestamp >= periodStart && r.timestamp <= periodEnd)
        .map((r) => ({
          validatorId: r.validatorId,
          amount: BigInt(r.amount),
          timestamp: r.timestamp,
        }))

      // Create portfolio summary
      const summary = createPortfolioSummary(validatorsWithContext, rewardEvents)

      // Create custodian breakdown
      const custodianBreakdown = rollupValidatorsToCustodian(validatorsWithContext, rewardEvents)

      // Build report data
      const reportData = {
        reportId,
        entityId,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
        methodologyVersion: METHODOLOGY_VERSION,
        generatedAt: new Date().toISOString(),
        summary: {
          totalValue: summary.totalValue.toString(),
          trailingApy30d: summary.trailingApy30d,
          validatorCount: summary.validatorCount,
          stateBuckets: {
            deposited: summary.stateBuckets.deposited.toString(),
            entryQueue: summary.stateBuckets.entryQueue.toString(),
            active: summary.stateBuckets.active.toString(),
            exiting: summary.stateBuckets.exiting.toString(),
            withdrawable: summary.stateBuckets.withdrawable.toString(),
          },
        },
        custodianBreakdown: custodianBreakdown.map((c) => ({
          custodianId: c.custodianId,
          custodianName: c.custodianName,
          value: c.value.toString(),
          percentage: c.percentage,
          trailingApy30d: c.trailingApy30d,
          validatorCount: c.validatorCount,
        })),
        validatorSchedule: validatorsWithContext.map((v) => ({
          validatorId: v.id,
          pubkey: v.pubkey,
          operatorName: v.operatorName,
          custodianName: v.custodianName,
          status: v.status,
          stakeState: v.stakeState,
          balance: v.balance.toString(),
          effectiveBalance: v.effectiveBalance.toString(),
        })),
      }

      // Update report with data
      let filePath: string | undefined

      if (format === 'csv' || format === 'pdf') {
        // For CSV/PDF, we'd generate a file - for now, just set a placeholder path
        filePath = `/reports/${reportId}.${format}`
      }

      await db
        .update(reports)
        .set({
          status: 'complete',
          data: reportData,
          filePath,
          generatedAt: new Date(),
        })
        .where(eq(reports.id, reportId))

      return NextResponse.json({
        data: {
          reportId,
          entityId,
          periodStart: periodStart.toISOString(),
          periodEnd: periodEnd.toISOString(),
          methodologyVersion: METHODOLOGY_VERSION,
          format,
          status: 'complete',
          filePath,
          generatedAt: new Date().toISOString(),
          summary: reportData.summary,
        },
      })
    } catch (genError) {
      // Mark report as failed
      await db
        .update(reports)
        .set({ status: 'failed' })
        .where(eq(reports.id, reportId))

      throw genError
    }
  } catch (error) {
    console.error('Report generation API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}
