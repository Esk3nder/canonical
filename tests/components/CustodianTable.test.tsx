/**
 * CustodianTable Component Tests
 */
import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'

import { CustodianTable } from '@/components/dashboard/CustodianTable'
import { CurrencyProvider } from '@/contexts/CurrencyContext'

function TestWrapper({ children }: { children: React.ReactNode }) {
  return <CurrencyProvider>{children}</CurrencyProvider>
}

describe('CustodianTable', () => {
  const mockData = [
    {
      custodianId: 'custodian-2',
      custodianName: 'Anchorage Digital',
      value: '1500000000000000000',
      percentage: 0.3,
      trailingApy30d: 0.042,
      validatorCount: 47,
    },
    {
      custodianId: 'custodian-3',
      custodianName: 'BitGo',
      value: '500000000000000000',
      percentage: 0.1,
      trailingApy30d: 0.045,
      validatorCount: 15,
    },
    {
      custodianId: 'custodian-1',
      custodianName: 'Coinbase Prime',
      value: '3000000000000000000',
      percentage: 0.6,
      trailingApy30d: 0.048,
      validatorCount: 94,
    },
  ]

  it('defaults to value descending order', () => {
    render(<CustodianTable data={mockData} />, { wrapper: TestWrapper })

    const firstRow = screen.getByTestId('custodian-row-0')
    expect(within(firstRow).getByText('Coinbase Prime')).toBeInTheDocument()
  })

  it('maps row clicks to custodianId', () => {
    const onCustodianClick = vi.fn()
    render(<CustodianTable data={mockData} onCustodianClick={onCustodianClick} />, {
      wrapper: TestWrapper,
    })

    fireEvent.click(screen.getByTestId('custodian-row-0'))
    expect(onCustodianClick).toHaveBeenCalledWith('custodian-1')
  })

  it('renders formatted stake and APY values', () => {
    render(<CustodianTable data={mockData} />, { wrapper: TestWrapper })

    expect(screen.getByText(/3\.00 ETH/)).toBeInTheDocument()
    expect(screen.getByText(/4\.80%/)).toBeInTheDocument()
  })
})
