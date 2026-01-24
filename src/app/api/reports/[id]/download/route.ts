/**
 * Report Download API
 * GET /api/reports/:id/download - Download report in specified format
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { reports, validators, operators, custodians, stakeEvents } from '@/db/schema'
import { eq, and, gte, lte } from 'drizzle-orm'
import {
  generateMonthlyStatementCSV,
  generateMonthlyStatementPDFContent,
} from '@/services/export'
import {
  createPortfolioSummary,
  type ValidatorWithContext,
  type RewardEvent,
} from '@/services/rollup'
import type { StakeState, MonthlyStatement, ValidatorPerformance } from '@/domain/types'

const METHODOLOGY_VERSION = '1.0.0'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'

    // Fetch report
    const reportRows = await db
      .select()
      .from(reports)
      .where(eq(reports.id, id))
      .limit(1)

    if (reportRows.length === 0) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    const report = reportRows[0]

    // Fetch all validators with context for the report period
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

    // Fetch reward events for the period
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
          gte(stakeEvents.timestamp, report.periodStart),
          lte(stakeEvents.timestamp, report.periodEnd)
        )
      )

    const rewardEvents: RewardEvent[] = rewardRows.map((r) => ({
      validatorId: r.validatorId,
      amount: BigInt(r.amount),
      timestamp: r.timestamp,
    }))

    // Create portfolio summary
    const summary = createPortfolioSummary(validatorsWithContext, rewardEvents)

    // Create validator performance list
    const validatorPerformance: ValidatorPerformance[] = validatorsWithContext.map((v) => {
      const validatorRewards = rewardEvents.filter(e => e.validatorId === v.id)
      const rewardsTotal = validatorRewards.reduce((sum, e) => sum + e.amount, 0n)

      return {
        validatorId: v.id,
        pubkey: v.pubkey,
        operatorName: v.operatorName,
        custodianName: v.custodianName,
        status: v.status as any,
        stakeState: v.stakeState,
        balance: v.balance,
        effectiveBalance: v.effectiveBalance,
        trailingApy30d: 0.045, // Simplified for export
        rewardsTotal,
        penalties: 0n,
        lastActivityTimestamp: new Date(),
      }
    })

    // Build monthly statement
    const statement: MonthlyStatement = {
      reportId: report.id,
      entityId: report.entityId || undefined,
      periodStart: report.periodStart,
      periodEnd: report.periodEnd,
      methodologyVersion: METHODOLOGY_VERSION,
      generatedAt: new Date(),
      summary,
      validatorSchedule: validatorPerformance,
      custodianBreakdown: summary.custodianBreakdown,
    }

    // Generate export content based on format
    if (format === 'csv') {
      const csv = generateMonthlyStatementCSV(statement)
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="report-${id}.csv"`,
        },
      })
    } else if (format === 'pdf') {
      const html = generateMonthlyStatementPDFContent(statement)
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="report-${id}.html"`,
        },
      })
    } else {
      // JSON format
      return NextResponse.json({
        data: {
          ...statement,
          summary: {
            ...statement.summary,
            totalValue: statement.summary.totalValue.toString(),
            stateBuckets: {
              active: statement.summary.stateBuckets.active.toString(),
              inTransit: statement.summary.stateBuckets.inTransit.toString(),
              rewards: statement.summary.stateBuckets.rewards.toString(),
              exiting: statement.summary.stateBuckets.exiting.toString(),
            },
            custodianBreakdown: statement.summary.custodianBreakdown.map(c => ({
              ...c,
              value: c.value.toString(),
            })),
          },
          validatorSchedule: statement.validatorSchedule.map(v => ({
            ...v,
            balance: v.balance.toString(),
            effectiveBalance: v.effectiveBalance.toString(),
            rewardsTotal: v.rewardsTotal.toString(),
            penalties: v.penalties.toString(),
            lastActivityTimestamp: v.lastActivityTimestamp.toISOString(),
          })),
          custodianBreakdown: statement.custodianBreakdown.map(c => ({
            ...c,
            value: c.value.toString(),
          })),
        },
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error('Report download API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate report download' },
      { status: 500 }
    )
  }
}
