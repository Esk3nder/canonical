/**
 * ExceptionSummary Component Tests
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ExceptionSummary } from '@/components/dashboard/ExceptionSummary'

describe('ExceptionSummary', () => {
  const mockData = {
    total: 5,
    bySeverity: {
      critical: 1,
      high: 2,
      medium: 1,
      low: 1,
    },
    recent: [
      {
        id: 'exception-1',
        type: 'portfolio_value_change',
        title: 'Portfolio value increased 8.5%',
        severity: 'critical',
        detectedAt: '2024-01-15T10:00:00Z',
        isNew: true,
      },
      {
        id: 'exception-2',
        type: 'in_transit_stuck',
        title: 'Validator abc123 stuck in transit for 12 days',
        severity: 'high',
        detectedAt: '2024-01-14T08:00:00Z',
        isNew: false,
      },
      {
        id: 'exception-3',
        type: 'performance_divergence',
        title: 'BitGo underperforming by 25%',
        severity: 'high',
        detectedAt: '2024-01-13T14:00:00Z',
        isNew: false,
      },
    ],
  }

  it('shows count of open exceptions', () => {
    render(<ExceptionSummary data={mockData} />)

    expect(screen.getByTestId('exception-count')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('shows most critical exceptions', () => {
    render(<ExceptionSummary data={mockData} />)

    // Should show the critical and high severity exceptions
    expect(screen.getByText(/Portfolio value increased/i)).toBeInTheDocument()
    expect(screen.getByText(/abc123 stuck/i)).toBeInTheDocument()
  })

  it('links to exception queue', () => {
    const onViewAll = vi.fn()
    render(<ExceptionSummary data={mockData} onViewAll={onViewAll} />)

    const viewAllLink = screen.getByTestId('view-all-exceptions')
    fireEvent.click(viewAllLink)

    expect(onViewAll).toHaveBeenCalled()
  })

  it('highlights new exceptions', () => {
    render(<ExceptionSummary data={mockData} />)

    // The first exception should have a "new" indicator
    const newBadge = screen.getByTestId('exception-new-badge')
    expect(newBadge).toBeInTheDocument()
  })

  it('shows severity breakdown', () => {
    render(<ExceptionSummary data={mockData} />)

    expect(screen.getByTestId('severity-breakdown')).toBeInTheDocument()
    expect(screen.getByText(/1 Critical/i)).toBeInTheDocument()
    expect(screen.getByText(/2 High/i)).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<ExceptionSummary data={null} isLoading={true} />)

    expect(screen.getByTestId('summary-loading')).toBeInTheDocument()
  })

  it('shows empty state when no exceptions', () => {
    render(
      <ExceptionSummary
        data={{
          total: 0,
          bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
          recent: [],
        }}
      />
    )

    expect(screen.getByText(/No open exceptions/i)).toBeInTheDocument()
  })

  it('clicking exception navigates to detail', () => {
    const onExceptionClick = vi.fn()
    render(
      <ExceptionSummary data={mockData} onExceptionClick={onExceptionClick} />
    )

    // Click on first exception
    fireEvent.click(screen.getByText(/Portfolio value increased/i))

    expect(onExceptionClick).toHaveBeenCalledWith('exception-1')
  })
})
