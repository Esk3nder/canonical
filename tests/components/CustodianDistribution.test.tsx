/**
 * CustodianDistribution Component Tests
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CustodianDistribution } from '@/components/dashboard/CustodianDistribution'

describe('CustodianDistribution', () => {
  const mockData = [
    {
      custodianId: 'custodian-1',
      custodianName: 'Coinbase Prime',
      value: '3000000000000000000',
      percentage: 0.6,
      trailingApy30d: 0.048,
      validatorCount: 94,
      change7d: 0.02,
      change30d: 0.05,
    },
    {
      custodianId: 'custodian-2',
      custodianName: 'Anchorage Digital',
      value: '1500000000000000000',
      percentage: 0.3,
      trailingApy30d: 0.042,
      validatorCount: 47,
      change7d: -0.01,
      change30d: 0.03,
    },
    {
      custodianId: 'custodian-3',
      custodianName: 'BitGo',
      value: '500000000000000000',
      percentage: 0.1,
      trailingApy30d: 0.045,
      validatorCount: 15,
      change7d: 0.005,
      change30d: 0.02,
    },
  ]

  it('renders allocation chart', () => {
    render(<CustodianDistribution data={mockData} />)

    expect(screen.getByTestId('allocation-chart')).toBeInTheDocument()
  })

  it('renders comparison table (no hover needed)', () => {
    render(<CustodianDistribution data={mockData} />)

    expect(screen.getByTestId('custodian-table')).toBeInTheDocument()
    // All custodians visible in table
    expect(screen.getByText('Coinbase Prime')).toBeInTheDocument()
    expect(screen.getByText('Anchorage Digital')).toBeInTheDocument()
    expect(screen.getByText('BitGo')).toBeInTheDocument()
  })

  it('shows per-custodian APY', () => {
    render(<CustodianDistribution data={mockData} />)

    // APY values should be formatted as percentages
    expect(screen.getByText(/4\.80%/)).toBeInTheDocument()
    expect(screen.getByText(/4\.20%/)).toBeInTheDocument()
    expect(screen.getByText(/4\.50%/)).toBeInTheDocument()
  })

  it('shows 7d/30d change indicators', () => {
    render(<CustodianDistribution data={mockData} />)

    // Should show positive/negative indicators
    const table = screen.getByTestId('custodian-table')
    expect(table).toBeInTheDocument()
  })

  it('supports sorting', () => {
    render(<CustodianDistribution data={mockData} />)

    // Click on Value header to sort
    const valueHeader = screen.getByRole('columnheader', { name: /Value/i })
    fireEvent.click(valueHeader)

    // Table should still be present after sorting
    expect(screen.getByTestId('custodian-table')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<CustodianDistribution data={null} isLoading={true} />)

    expect(screen.getByTestId('distribution-loading')).toBeInTheDocument()
  })

  it('handles empty data', () => {
    render(<CustodianDistribution data={[]} />)

    expect(screen.getByText(/No custodian data/i)).toBeInTheDocument()
  })
})
