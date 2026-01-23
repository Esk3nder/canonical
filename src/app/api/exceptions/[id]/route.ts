/**
 * Exception Detail API
 * GET /api/exceptions/:id - Returns exception detail
 * PATCH /api/exceptions/:id - Updates exception status
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { exceptions } from '@/db/schema'
import { eq } from 'drizzle-orm'
import type { ExceptionStatus } from '@/domain/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

// Valid status transitions
const VALID_TRANSITIONS: Record<ExceptionStatus, ExceptionStatus[]> = {
  new: ['investigating', 'resolved'],
  investigating: ['new', 'resolved'],
  resolved: [], // Cannot transition from resolved
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const exceptionRows = await db
      .select()
      .from(exceptions)
      .where(eq(exceptions.id, id))
      .limit(1)

    if (exceptionRows.length === 0) {
      return NextResponse.json(
        { error: 'Exception not found' },
        { status: 404 }
      )
    }

    const e = exceptionRows[0]

    return NextResponse.json({
      data: {
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
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Exception detail API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exception' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()

    // Fetch current exception
    const exceptionRows = await db
      .select()
      .from(exceptions)
      .where(eq(exceptions.id, id))
      .limit(1)

    if (exceptionRows.length === 0) {
      return NextResponse.json(
        { error: 'Exception not found' },
        { status: 404 }
      )
    }

    const currentException = exceptionRows[0]

    // Validate status transition if status is being updated
    if (body.status) {
      const validTransitions = VALID_TRANSITIONS[currentException.status as ExceptionStatus]

      if (!validTransitions.includes(body.status)) {
        return NextResponse.json(
          {
            error: 'Invalid status transition',
            message: `Cannot transition from '${currentException.status}' to '${body.status}'`,
          },
          { status: 400 }
        )
      }
    }

    // Build update object
    const updateData: {
      status?: string
      resolution?: string
      resolvedBy?: string
      resolvedAt?: Date
      updatedAt: Date
    } = {
      updatedAt: new Date(),
    }

    if (body.status) {
      updateData.status = body.status
    }

    if (body.resolution) {
      updateData.resolution = body.resolution
    }

    if (body.resolvedBy) {
      updateData.resolvedBy = body.resolvedBy
    }

    // Set resolvedAt if status is being set to resolved
    if (body.status === 'resolved') {
      updateData.resolvedAt = new Date()
    }

    // Perform update
    await db
      .update(exceptions)
      .set(updateData)
      .where(eq(exceptions.id, id))

    // Fetch updated exception
    const updatedRows = await db
      .select()
      .from(exceptions)
      .where(eq(exceptions.id, id))
      .limit(1)

    const e = updatedRows[0]

    return NextResponse.json({
      data: {
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
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Exception update API error:', error)
    return NextResponse.json(
      { error: 'Failed to update exception' },
      { status: 500 }
    )
  }
}
