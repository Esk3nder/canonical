/**
 * ValidatorTable Component Tests
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ValidatorTable } from '@/components/dashboard/ValidatorTable'

describe('ValidatorTable', () => {
  const mockData = [
    {
      id: 'validator-1',
      pubkey: '0x8a3c6f8d9e2b4a5c7d1e3f6a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c',
      operatorName: 'Coinbase Cloud',
      custodianName: 'Coinbase Prime',
      status: 'active',
      stakeState: 'active',
      balance: '32100000000',
      effectiveBalance: '32000000000',
      trailingApy30d: 0.048,
    },
    {
      id: 'validator-2',
      pubkey: '0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c',
      operatorName: 'Figment',
      custodianName: 'Anchorage Digital',
      status: 'active',
      stakeState: 'active',
      balance: '32050000000',
      effectiveBalance: '32000000000',
      trailingApy30d: 0.045,
    },
    {
      id: 'validator-3',
      pubkey: '0x2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d',
      operatorName: 'BitGo Staking',
      custodianName: 'BitGo',
      status: 'pending',
      stakeState: 'pending_activation',
      balance: '32000000000',
      effectiveBalance: '32000000000',
      trailingApy30d: 0,
    },
  ]

  it('renders validator list', () => {
    render(<ValidatorTable data={mockData} total={3} />)

    expect(screen.getByTestId('validator-table')).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(4) // header + 3 rows
  })

  it('shows status/state per validator', () => {
    render(<ValidatorTable data={mockData} total={3} />)

    expect(screen.getAllByText('active').length).toBeGreaterThan(0)
    expect(screen.getByText('pending')).toBeInTheDocument()
  })

  it('shows performance indicators', () => {
    render(<ValidatorTable data={mockData} total={3} />)

    // Should show APY values
    expect(screen.getByText(/4\.80%/)).toBeInTheDocument()
    expect(screen.getByText(/4\.50%/)).toBeInTheDocument()
  })

  it('supports pagination', () => {
    const onPageChange = vi.fn()
    render(
      <ValidatorTable
        data={mockData}
        total={100}
        page={1}
        pageSize={10}
        onPageChange={onPageChange}
      />
    )

    expect(screen.getByTestId('pagination')).toBeInTheDocument()

    // Click next page
    fireEvent.click(screen.getByTestId('next-page'))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('supports filtering by state', () => {
    const onFilterChange = vi.fn()
    render(
      <ValidatorTable
        data={mockData}
        total={3}
        onFilterChange={onFilterChange}
      />
    )

    // Select a filter
    const filterSelect = screen.getByTestId('state-filter')
    fireEvent.change(filterSelect, { target: { value: 'active' } })

    expect(onFilterChange).toHaveBeenCalledWith({ stakeState: 'active' })
  })

  it('rows link to detail view', () => {
    const onRowClick = vi.fn()
    render(
      <ValidatorTable
        data={mockData}
        total={3}
        onRowClick={onRowClick}
      />
    )

    // Click on first row
    const rows = screen.getAllByRole('row')
    fireEvent.click(rows[1]) // Skip header row

    expect(onRowClick).toHaveBeenCalledWith('validator-1')
  })

  it('shows loading state', () => {
    render(<ValidatorTable data={null} total={0} isLoading={true} />)

    expect(screen.getByTestId('table-loading')).toBeInTheDocument()
  })

  it('shows empty state', () => {
    render(<ValidatorTable data={[]} total={0} />)

    expect(screen.getByText(/No validators found/i)).toBeInTheDocument()
  })

  it('shortens pubkey for display', () => {
    render(<ValidatorTable data={mockData} total={3} />)

    // Should show shortened pubkey (0x8a3c...6b7c format)
    expect(screen.getByText(/0x8a3c/)).toBeInTheDocument()
  })
})
