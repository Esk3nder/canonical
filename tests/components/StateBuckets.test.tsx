/**
 * StateBuckets Component Tests
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StateBuckets } from '@/components/dashboard/StateBuckets'
import { CurrencyProvider } from '@/contexts/CurrencyContext'

function TestWrapper({ children }: { children: React.ReactNode }) {
  return <CurrencyProvider>{children}</CurrencyProvider>
}

describe('StateBuckets', () => {
  const mockData = {
    active: '4500000000000000000',    // 4500 ETH
    inTransit: '300000000000000000',  // 300 ETH
    rewards: '150000000000000000',    // 150 ETH
    exiting: '50000000000000000',     // 50 ETH
  }

  const totalValue = '5000000000000000000' // 5000 ETH

  it('renders all four state buckets', () => {
    render(<StateBuckets data={mockData} totalValue={totalValue} />, { wrapper: TestWrapper })

    expect(screen.getByTestId('bucket-active')).toBeInTheDocument()
    expect(screen.getByTestId('bucket-in-transit')).toBeInTheDocument()
    expect(screen.getByTestId('bucket-rewards')).toBeInTheDocument()
    expect(screen.getByTestId('bucket-exiting')).toBeInTheDocument()
  })

  it('shows values and percentages', () => {
    render(<StateBuckets data={mockData} totalValue={totalValue} />, { wrapper: TestWrapper })

    // Active should be 90%
    expect(screen.getByText(/90\.00%/)).toBeInTheDocument()
    // In Transit should be 6%
    expect(screen.getByText(/6\.00%/)).toBeInTheDocument()
  })

  it('buckets are clickable for drilldown', () => {
    const onBucketClick = vi.fn()
    render(
      <StateBuckets
        data={mockData}
        totalValue={totalValue}
        onBucketClick={onBucketClick}
      />,
      { wrapper: TestWrapper }
    )

    fireEvent.click(screen.getByTestId('bucket-active'))
    expect(onBucketClick).toHaveBeenCalledWith('active')

    fireEvent.click(screen.getByTestId('bucket-in-transit'))
    expect(onBucketClick).toHaveBeenCalledWith('in_transit')
  })

  it('highlights anomalies when threshold exceeded', () => {
    const anomalyData = {
      ...mockData,
      inTransit: '1000000000000000000', // 20% - anomaly threshold
    }

    render(
      <StateBuckets
        data={anomalyData}
        totalValue={totalValue}
        anomalyThreshold={0.1}
      />,
      { wrapper: TestWrapper }
    )

    const inTransitBucket = screen.getByTestId('bucket-in-transit')
    expect(inTransitBucket).toHaveClass('border-amber-500')
  })

  it('shows loading state', () => {
    render(<StateBuckets data={null} totalValue="0" isLoading={true} />, { wrapper: TestWrapper })

    expect(screen.getByTestId('buckets-loading')).toBeInTheDocument()
  })
})
