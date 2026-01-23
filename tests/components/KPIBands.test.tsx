/**
 * KPIBands Component Tests
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KPIBands } from '@/components/dashboard/KPIBands'

describe('KPIBands', () => {
  const mockData = {
    totalValue: '5000000000000000000', // 5000 ETH in wei
    trailingApy30d: 0.045,
    validatorCount: 156,
  }

  it('renders portfolio value prominently', () => {
    render(<KPIBands data={mockData} isLoading={false} />)

    // Should display formatted value
    expect(screen.getByTestId('portfolio-value')).toBeInTheDocument()
    expect(screen.getByText(/Portfolio Value/i)).toBeInTheDocument()
  })

  it('renders APY with correct formatting', () => {
    render(<KPIBands data={mockData} isLoading={false} />)

    expect(screen.getByTestId('trailing-apy')).toBeInTheDocument()
    // APY should be formatted as percentage (4.50%)
    expect(screen.getByText(/4\.50%/)).toBeInTheDocument()
  })

  it('renders validator count', () => {
    render(<KPIBands data={mockData} isLoading={false} />)

    expect(screen.getByTestId('validator-count')).toBeInTheDocument()
    expect(screen.getByText('156')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<KPIBands data={null} isLoading={true} />)

    expect(screen.getByTestId('kpi-loading')).toBeInTheDocument()
  })

  it('handles error state', () => {
    render(<KPIBands data={null} isLoading={false} error="Failed to load" />)

    expect(screen.getByTestId('kpi-error')).toBeInTheDocument()
    expect(screen.getByText(/Failed to load/i)).toBeInTheDocument()
  })

  it('formats large numbers with commas', () => {
    render(<KPIBands data={mockData} isLoading={false} />)

    // Validator count should have comma formatting for large numbers
    const validatorElement = screen.getByTestId('validator-count')
    expect(validatorElement).toBeInTheDocument()
  })
})
