/**
 * Exceptions API
 * GET /api/exceptions - Returns exception queue with filtering
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { exceptions } from '@/db/schema'
import { eq, desc, count, and, SQL } from 'drizzle-orm'
import type { ExceptionStatus } from '@/domain/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse pagination params
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '50', 10), 100)
    const offset = (page - 1) * pageSize

    // Parse filter params
    const status = searchParams.get('status') as ExceptionStatus | null
    const severity = searchParams.get('severity')
    const type = searchParams.get('type')

    // Build where conditions
    const conditions: SQL<unknown>[] = []

    if (status) {
      conditions.push(eq(exceptions.status, status))
    }

    if (severity) {
      conditions.push(eq(exceptions.severity, severity as 'low' | 'medium' | 'high' | 'critical'))
    }

    if (type) {
      conditions.push(eq(exceptions.type, type as any))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Get total count
    const countQuery = db.select({ value: count() }).from(exceptions)
    if (whereClause) {
      countQuery.where(whereClause)
    }
    const countResult = await countQuery
    const total = countResult[0]?.value || 0

    // Fetch exceptions with pagination
    const query = db
      .select()
      .from(exceptions)
      .orderBy(desc(exceptions.detectedAt))
      .limit(pageSize)
      .offset(offset)

    if (whereClause) {
      query.where(whereClause)
    }

    const exceptionRows = await query

    // Transform for response
    const data = exceptionRows.map((e) => ({
      id: e.id,
      type: e.type,
      status: e.status,
      title: e.title,
      description: e.description,
      severity: e.severity,
      evidenceLinks: e.evidenceLinks,
      detectedAt: e.detectedAt.toISOString(),
      resolvedAt: e.resolvedAt?.toISOString(),
      resolvedBy: e.resolvedBy,
      resolution: e.resolution,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    }))

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      hasMore: offset + data.length < total,
    })
  } catch (error) {
    console.error('Exceptions API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exceptions' },
      { status: 500 }
    )
  }
}
