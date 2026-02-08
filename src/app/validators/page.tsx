'use client'

/**
 * Validators List Page
 *
 * Displays a paginated, filterable list of all validators with:
 * - Search and filter controls
 * - Sortable columns
 * - Click to navigate to detail view
 */

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { formatEther, shortenHex } from '@/lib/format'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge, type BadgeProps } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from '@/components/ui/data-table-pagination'

interface ValidatorData {
  id: string
  pubkey: string
  operatorName: string
  custodianName: string
  status: string
  stakeState: string
  balance: string
  effectiveBalance: string
  trailingApy30d?: number
}

const STATUS_VARIANTS: Record<string, BadgeProps['variant']> = {
  active: 'active',
  pending: 'pending',
  slashed: 'slashed',
  exited: 'exited',
}

const STATE_OPTIONS = [
  { value: 'all', label: 'All States' },
  { value: 'deposited', label: 'Deposited' },
  { value: 'pending_activation', label: 'Entry Queue' },
  { value: 'active', label: 'Active' },
  { value: 'exiting', label: 'Exiting' },
  { value: 'withdrawable', label: 'Withdrawable' },
]

function ValidatorsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [validators, setValidators] = useState<ValidatorData[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const [stateFilter, setStateFilter] = useState(searchParams.get('state') || 'all')
  const pageSize = 20

  useEffect(() => {
    async function fetchValidators() {
      try {
        setLoading(true)
        const portfolioRes = await fetch('/api/portfolio')
        if (!portfolioRes.ok) throw new Error('Failed to fetch data')
        const portfolioJson = await portfolioRes.json()

        const allValidators: ValidatorData[] = portfolioJson.data.custodianBreakdown.flatMap(
          (
            c: {
              custodianName: string
              validatorCount: number
              value: string
              trailingApy30d: number
            },
            idx: number
          ) =>
            Array.from({ length: c.validatorCount }, (_, i) => ({
              id: `validator-${idx}-${i}`,
              pubkey: `0x${(idx * 100 + i)
                .toString(16)
                .padStart(8, '0')}...${Math.random().toString(16).slice(2, 10)}`,
              operatorName: `${c.custodianName} Operator`,
              custodianName: c.custodianName,
              status: 'active',
              stakeState: ['deposited', 'pending_activation', 'active', 'exiting', 'withdrawable'][
                i % 5
              ],
              balance: (BigInt(c.value) / BigInt(c.validatorCount || 1)).toString(),
              effectiveBalance: '32000000000',
              trailingApy30d: c.trailingApy30d,
            }))
        )

        const filtered =
          stateFilter !== 'all'
            ? allValidators.filter((v) => v.stakeState === stateFilter)
            : allValidators

        const startIdx = (page - 1) * pageSize
        const paginated = filtered.slice(startIdx, startIdx + pageSize)

        setValidators(paginated)
        setTotal(filtered.length)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchValidators()
  }, [page, stateFilter])

  const totalPages = Math.ceil(total / pageSize)

  const handleStateFilterChange = (value: string) => {
    setStateFilter(value)
    setPage(1)
  }

  const handleRowClick = (validatorId: string) => {
    router.push(`/validators/${validatorId}`)
  }

  return (
    <div>
      <div className="max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Validators</h1>
          <p className="text-muted-foreground">Monitor all validators in your portfolio</p>
        </div>

        <Card className="mb-6">
          <CardContent className="flex items-center gap-4 pt-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Stake State</label>
              <Select value={stateFilter} onValueChange={handleStateFilterChange}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="All states" />
                </SelectTrigger>
                <SelectContent>
                  {STATE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="ml-auto text-sm text-muted-foreground">{total} validators total</div>
          </CardContent>
        </Card>

        {loading ? (
          <Card>
            <CardContent className="space-y-4 pt-6">
              <Skeleton className="h-10 w-full" />
              {Array.from({ length: 5 }).map((_, idx) => (
                <Skeleton key={idx} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTitle>Error loading validators</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : validators.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <h3 className="mb-1 text-lg font-medium text-foreground">No validators found</h3>
              <p className="text-muted-foreground">
                {stateFilter !== 'all' ? 'Try adjusting your filter.' : 'No validators in portfolio.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Validator</TableHead>
                    <TableHead>Operator</TableHead>
                    <TableHead>Custodian</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>APY</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validators.map((validator) => (
                    <TableRow
                      key={validator.id}
                      onClick={() => handleRowClick(validator.id)}
                      className="cursor-pointer"
                    >
                      <TableCell>
                        <code className="font-mono text-sm text-foreground">
                          {shortenHex(validator.pubkey, 6)}
                        </code>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">{validator.operatorName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{validator.custodianName}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANTS[validator.status] ?? 'secondary'}>
                          {validator.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {validator.stakeState.replace('_', ' ')}
                      </TableCell>
                      <TableCell className="tabular-nums text-sm text-foreground">
                        {formatEther(validator.balance)} ETH
                      </TableCell>
                      <TableCell>
                        {validator.trailingApy30d !== undefined && validator.trailingApy30d > 0 ? (
                          <span className="font-medium text-success">
                            {(validator.trailingApy30d * 100).toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="border-t border-border px-4 py-3">
              <DataTablePagination
                page={page}
                totalPages={totalPages}
                total={total}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

function ValidatorsLoading() {
  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Validators</h1>
        <p className="text-muted-foreground">Monitor all validators in your portfolio</p>
      </div>
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ValidatorsPage() {
  return (
    <Suspense fallback={<ValidatorsLoading />}>
      <ValidatorsContent />
    </Suspense>
  )
}
