/**
 * Report Detail API
 * GET /api/reports/:id - Returns report details and data
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { reports } from '@/db/schema'
import { eq } from 'drizzle-orm'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

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

    const r = reportRows[0]

    return NextResponse.json({
      data: {
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
        // Include report data if complete
        ...(r.status === 'complete' && r.data ? { reportData: r.data } : {}),
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Report detail API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    )
  }
}
