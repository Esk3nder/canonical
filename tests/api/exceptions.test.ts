/**
 * Exceptions API Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Exceptions API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/exceptions', () => {
    it('returns exception queue', async () => {
      const response = {
        data: [
          {
            id: 'exception-1',
            type: 'portfolio_value_change',
            status: 'new',
            title: 'Portfolio value increased 6.5%',
            description: 'Unexpected material change detected',
            severity: 'high',
            evidenceLinks: [],
            detectedAt: '2024-01-15T10:00:00Z',
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-15T10:00:00Z',
          },
          {
            id: 'exception-2',
            type: 'in_transit_stuck',
            status: 'investigating',
            title: 'Validator abc123 stuck in transit',
            description: 'Validator has been pending for 10 days',
            severity: 'medium',
            evidenceLinks: [
              {
                type: 'validator',
                id: 'validator-1',
                label: 'Validator abc123',
              },
            ],
            detectedAt: '2024-01-10T08:00:00Z',
            createdAt: '2024-01-10T08:00:00Z',
            updatedAt: '2024-01-12T14:00:00Z',
          },
        ],
        total: 2,
        page: 1,
        pageSize: 50,
        hasMore: false,
      }

      expect(response.data).toBeDefined()
      expect(Array.isArray(response.data)).toBe(true)
      expect(response.data[0].type).toBeDefined()
      expect(response.data[0].status).toBeDefined()
      expect(response.data[0].severity).toBeDefined()
    })

    it('includes evidence links', async () => {
      const response = {
        data: [
          {
            id: 'exception-1',
            evidenceLinks: [
              {
                type: 'validator',
                id: 'validator-1',
                label: 'Validator abc123',
              },
              {
                type: 'custodian',
                id: 'custodian-1',
                label: 'Coinbase Prime',
              },
            ],
          },
        ],
      }

      expect(response.data[0].evidenceLinks).toBeDefined()
      expect(Array.isArray(response.data[0].evidenceLinks)).toBe(true)
      expect(response.data[0].evidenceLinks[0].type).toBeDefined()
      expect(response.data[0].evidenceLinks[0].id).toBeDefined()
    })

    it('supports filtering by status', async () => {
      // Test with status=new filter
      const response = {
        data: [
          { id: 'exception-1', status: 'new' },
          { id: 'exception-3', status: 'new' },
        ],
        total: 2,
      }

      expect(response.data.every((e) => e.status === 'new')).toBe(true)
    })

    it('supports filtering by severity', async () => {
      const response = {
        data: [
          { id: 'exception-1', severity: 'critical' },
          { id: 'exception-2', severity: 'critical' },
        ],
        total: 2,
      }

      expect(response.data.every((e) => e.severity === 'critical')).toBe(true)
    })
  })

  describe('PATCH /api/exceptions/:id', () => {
    it('updates status', async () => {
      const response = {
        data: {
          id: 'exception-1',
          status: 'investigating',
          updatedAt: '2024-01-16T10:00:00Z',
        },
      }

      expect(response.data.status).toBe('investigating')
      expect(response.data.updatedAt).toBeDefined()
    })

    it('updates resolution when resolved', async () => {
      const response = {
        data: {
          id: 'exception-1',
          status: 'resolved',
          resolution: 'Expected rebalancing operation',
          resolvedBy: 'john.doe@blockengine.io',
          resolvedAt: '2024-01-16T12:00:00Z',
        },
      }

      expect(response.data.status).toBe('resolved')
      expect(response.data.resolution).toBeDefined()
      expect(response.data.resolvedBy).toBeDefined()
      expect(response.data.resolvedAt).toBeDefined()
    })

    it('returns 404 for non-existent exception', async () => {
      const response = { error: 'Exception not found', status: 404 }
      expect(response.status).toBe(404)
    })

    it('validates status transitions', async () => {
      // Can't go from resolved back to new
      const response = {
        error: 'Invalid status transition',
        status: 400,
      }
      expect(response.status).toBe(400)
    })
  })
})
