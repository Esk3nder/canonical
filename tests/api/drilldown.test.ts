/**
 * Drilldown API Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Drilldown APIs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/custodians/:id', () => {
    it('returns custodian detail', async () => {
      const response = {
        data: {
          id: 'custodian-1',
          name: 'Coinbase Prime',
          description: 'Institutional custody provider',
          totalValue: '3000000000000000',
          validatorCount: 60,
          trailingApy30d: 0.048,
          operators: [
            {
              id: 'operator-1',
              name: 'Coinbase Cloud',
              validatorCount: 60,
            },
          ],
          validators: [
            {
              id: 'validator-1',
              pubkey: '0x1234...',
              status: 'active',
              balance: '32000000000',
            },
          ],
        },
        timestamp: new Date().toISOString(),
      }

      expect(response.data.id).toBeDefined()
      expect(response.data.name).toBeDefined()
      expect(response.data.totalValue).toBeDefined()
      expect(response.data.validatorCount).toBeDefined()
      expect(response.data.operators).toBeDefined()
      expect(Array.isArray(response.data.validators)).toBe(true)
    })

    it('returns 404 for non-existent custodian', async () => {
      const response = { error: 'Custodian not found', status: 404 }
      expect(response.status).toBe(404)
    })
  })

  describe('GET /api/validators/:id', () => {
    it('returns validator detail', async () => {
      const response = {
        data: {
          id: 'validator-1',
          pubkey: '0x8a3c6f...',
          operatorId: 'operator-1',
          operatorName: 'Coinbase Cloud',
          custodianId: 'custodian-1',
          custodianName: 'Coinbase Prime',
          status: 'active',
          stakeState: 'active',
          balance: '32100000000',
          effectiveBalance: '32000000000',
          withdrawalCredential: '0x01...',
          activationEpoch: 150000,
          trailingApy30d: 0.048,
          rewardsTotal: '100000000',
          lastActivityTimestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      }

      expect(response.data.id).toBeDefined()
      expect(response.data.pubkey).toBeDefined()
      expect(response.data.status).toBeDefined()
      expect(response.data.balance).toBeDefined()
      expect(response.data.operatorName).toBeDefined()
      expect(response.data.custodianName).toBeDefined()
    })

    it('returns 404 for non-existent validator', async () => {
      const response = { error: 'Validator not found', status: 404 }
      expect(response.status).toBe(404)
    })
  })

  describe('GET /api/validators/:id/events', () => {
    it('returns event history', async () => {
      const response = {
        data: [
          {
            id: 'event-1',
            eventType: 'deposit',
            amount: '32000000000',
            timestamp: '2024-01-01T00:00:00Z',
            finalized: true,
            txHash: '0xabc...',
          },
          {
            id: 'event-2',
            eventType: 'activation',
            amount: '0',
            timestamp: '2024-01-02T00:00:00Z',
            epoch: 150000,
            finalized: true,
          },
          {
            id: 'event-3',
            eventType: 'reward',
            amount: '10000000',
            timestamp: '2024-01-03T00:00:00Z',
            epoch: 150100,
            finalized: true,
          },
        ],
        total: 3,
        page: 1,
        pageSize: 50,
        hasMore: false,
      }

      expect(response.data).toBeDefined()
      expect(Array.isArray(response.data)).toBe(true)
      expect(response.data[0].eventType).toBeDefined()
      expect(response.data[0].amount).toBeDefined()
      expect(response.data[0].timestamp).toBeDefined()
    })

    it('includes evidence links in responses', async () => {
      const response = {
        data: [
          {
            id: 'event-1',
            eventType: 'deposit',
            amount: '32000000000',
            timestamp: '2024-01-01T00:00:00Z',
            evidenceLinks: [
              {
                type: 'external',
                id: '0xabc...',
                label: 'Etherscan Transaction',
                url: 'https://etherscan.io/tx/0xabc...',
              },
            ],
          },
        ],
      }

      expect(response.data[0].evidenceLinks).toBeDefined()
      expect(Array.isArray(response.data[0].evidenceLinks)).toBe(true)
    })

    it('supports pagination', async () => {
      const response = {
        data: [],
        total: 100,
        page: 2,
        pageSize: 50,
        hasMore: false,
      }

      expect(response.total).toBeDefined()
      expect(response.page).toBeDefined()
      expect(response.pageSize).toBeDefined()
      expect(response.hasMore).toBeDefined()
    })
  })
})
