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
    deposited: '100000000000000000',    // 100 ETH
    entryQueue: '200000000000000000',   // 200 ETH
    active: '4500000000000000000',      // 4500 ETH
    exiting: '50000000000000000',       // 50 ETH
    withdrawable: '150000000000000000', // 150 ETH
  }

  const totalValue = '5000000000000000000' // 5000 ETH

  it('renders all five state buckets', () => {
    render(<StateBuckets data={mockData} totalValue={totalValue} />, { wrapper: TestWrapper })

    expect(screen.getByTestId('bucket-deposited')).toBeInTheDocument()
    expect(screen.getByTestId('bucket-entryQueue')).toBeInTheDocument()
    expect(screen.getByTestId('bucket-active')).toBeInTheDocument()
    expect(screen.getByTestId('bucket-exiting')).toBeInTheDocument()
    expect(screen.getByTestId('bucket-withdrawable')).toBeInTheDocument()
  })

  it('shows values and percentages', () => {
    render(<StateBuckets data={mockData} totalValue={totalValue} />, { wrapper: TestWrapper })

    // Active should be 90%
    expect(screen.getByText(/90\.00%/)).toBeInTheDocument()
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

    fireEvent.click(screen.getByTestId('bucket-entryQueue'))
    expect(onBucketClick).toHaveBeenCalledWith('pending_activation')
  })

  it('highlights anomalies when pre-active threshold exceeded', () => {
    const anomalyData = {
      ...mockData,
      deposited: '500000000000000000',  // 500 ETH
      entryQueue: '500000000000000000', // 500 ETH - total pre-active = 20%
    }

    render(
      <StateBuckets
        data={anomalyData}
        totalValue={totalValue}
        anomalyThreshold={0.1}
      />,
      { wrapper: TestWrapper }
    )

    const depositedBucket = screen.getByTestId('bucket-deposited')
    expect(depositedBucket).toHaveClass('border-apricot')

    const entryQueueBucket = screen.getByTestId('bucket-entryQueue')
    expect(entryQueueBucket).toHaveClass('border-apricot')
  })

  it('shows loading state', () => {
    render(<StateBuckets data={null} totalValue="0" isLoading={true} />, { wrapper: TestWrapper })

    expect(screen.getByTestId('buckets-loading')).toBeInTheDocument()
  })
})
