/**
 * KPIBands Component Tests
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KPIBands } from '@/components/dashboard/KPIBands'
import { CurrencyProvider } from '@/contexts/CurrencyContext'

// Wrapper component with CurrencyProvider
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <CurrencyProvider>{children}</CurrencyProvider>
}

describe('KPIBands', () => {
  const mockData = {
    totalValue: '5000000000000000000', // 5000 ETH in wei
    trailingApy30d: 0.045,
    previousMonthApy: 0.042,
    networkBenchmarkApy: 0.038,
    validatorCount: 156,
  }

  it('renders portfolio value prominently', () => {
    render(<KPIBands data={mockData} isLoading={false} />, { wrapper: TestWrapper })

    // Should display formatted value
    expect(screen.getByTestId('portfolio-value')).toBeInTheDocument()
    expect(screen.getByText(/Portfolio Value/i)).toBeInTheDocument()
  })

  it('renders APY with correct formatting', () => {
    render(<KPIBands data={mockData} isLoading={false} />, { wrapper: TestWrapper })

    expect(screen.getByTestId('trailing-apy')).toBeInTheDocument()
    // APY should be formatted as percentage (4.5%)
    expect(screen.getByText(/4\.5%/)).toBeInTheDocument()
  })

  it('renders Global Blended APY title', () => {
    render(<KPIBands data={mockData} isLoading={false} />, { wrapper: TestWrapper })

    expect(screen.getByText(/Global Blended APY/i)).toBeInTheDocument()
  })

  it('renders month-over-month change', () => {
    render(<KPIBands data={mockData} isLoading={false} />, { wrapper: TestWrapper })

    expect(screen.getByTestId('apy-change')).toBeInTheDocument()
    expect(screen.getByText(/vs last month/i)).toBeInTheDocument()
  })

  it('renders network benchmark (CESR)', () => {
    render(<KPIBands data={mockData} isLoading={false} />, { wrapper: TestWrapper })

    // Network benchmark now displayed as "CESR: X%"
    expect(screen.getByText(/CESR/i)).toBeInTheDocument()
    expect(screen.getByText(/3\.8%/)).toBeInTheDocument()
  })

  // Validator count is no longer displayed in KPIBands - it's in the expanded modal
  it('accepts validator count in data', () => {
    render(<KPIBands data={mockData} isLoading={false} />, { wrapper: TestWrapper })

    // Component should render without errors when validatorCount is provided
    expect(screen.getByTestId('portfolio-value')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<KPIBands data={null} isLoading={true} />, { wrapper: TestWrapper })

    expect(screen.getByTestId('kpi-loading')).toBeInTheDocument()
  })

  it('handles error state', () => {
    render(<KPIBands data={null} isLoading={false} error="Failed to load" />, { wrapper: TestWrapper })

    expect(screen.getByTestId('kpi-error')).toBeInTheDocument()
    expect(screen.getByText(/Failed to load/i)).toBeInTheDocument()
  })

  it('formats portfolio value correctly', () => {
    render(<KPIBands data={mockData} isLoading={false} />, { wrapper: TestWrapper })

    // Portfolio value should be displayed with proper formatting
    const portfolioElement = screen.getByTestId('portfolio-value')
    expect(portfolioElement).toBeInTheDocument()
  })

  it('shows positive APY change in green', () => {
    render(<KPIBands data={mockData} isLoading={false} />, { wrapper: TestWrapper })

    const apyChange = screen.getByTestId('apy-change')
    expect(apyChange).toHaveClass('text-green-600')
  })

  it('shows negative APY change in red', () => {
    const dataWithNegativeChange = {
      ...mockData,
      trailingApy30d: 0.035,
      previousMonthApy: 0.040,
    }
    render(<KPIBands data={dataWithNegativeChange} isLoading={false} />, { wrapper: TestWrapper })

    const apyChange = screen.getByTestId('apy-change')
    expect(apyChange).toHaveClass('text-red-600')
  })
})
