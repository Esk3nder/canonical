/**
 * Validator Events API
 * GET /api/validators/:id/events - Returns validator event history
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { stakeEvents, validators } from '@/db/schema'
import { eq, desc, count } from 'drizzle-orm'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)

    // Parse pagination params
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '50', 10), 100)
    const offset = (page - 1) * pageSize

    // Verify validator exists
    const validatorRows = await db
      .select({ id: validators.id })
      .from(validators)
      .where(eq(validators.id, id))
      .limit(1)

    if (validatorRows.length === 0) {
      return NextResponse.json(
        { error: 'Validator not found' },
        { status: 404 }
      )
    }

    // Get total count
    const countResult = await db
      .select({ value: count() })
      .from(stakeEvents)
      .where(eq(stakeEvents.validatorId, id))

    const total = countResult[0]?.value || 0

    // Fetch events with pagination
    const eventRows = await db
      .select()
      .from(stakeEvents)
      .where(eq(stakeEvents.validatorId, id))
      .orderBy(desc(stakeEvents.timestamp))
      .limit(pageSize)
      .offset(offset)

    // Transform events with evidence links
    const events = eventRows.map((e) => ({
      id: e.id,
      eventType: e.eventType,
      amount: e.amount,
      epoch: e.epoch,
      slot: e.slot,
      blockNumber: e.blockNumber,
      txHash: e.txHash,
      timestamp: e.timestamp.toISOString(),
      finalized: e.finalized,
      createdAt: e.createdAt.toISOString(),
      evidenceLinks: e.txHash
        ? [
            {
              type: 'external' as const,
              id: e.txHash,
              label: 'View on Etherscan',
              url: `https://etherscan.io/tx/${e.txHash}`,
            },
          ]
        : [],
    }))

    return NextResponse.json({
      data: events,
      total,
      page,
      pageSize,
      hasMore: offset + events.length < total,
    })
  } catch (error) {
    console.error('Validator events API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch validator events' },
      { status: 500 }
    )
  }
}
