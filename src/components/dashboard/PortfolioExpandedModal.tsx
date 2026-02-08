'use client'

/**
 * PortfolioExpandedModal Component
 *
 * Expanded view showing portfolio composition:
 * - Total value with 24h change
 * - Custodian breakdown (where is the ETH held?)
 * - Stake status (active vs non-earning)
 */

import { formatEther, formatNumber, formatUSD } from '@/lib/format'
import { useCurrency } from '@/contexts/CurrencyContext'
import { getCustodianColor } from '@/lib/custodian-colors'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface StateBuckets {
  deposited: string
  entryQueue: string
  active: string
  exiting: string
  withdrawable: string
}

interface CustodianAllocation {
  custodianId: string
  custodianName: string
  value: string
  percentage: number
  trailingApy30d: number
  validatorCount: number
  change7d?: number
  change30d?: number
}

interface PortfolioExpandedModalProps {
  isOpen: boolean
  onClose: () => void
  data: {
    totalValue: string
    change24h?: string
    stateBuckets: StateBuckets
    custodianBreakdown: CustodianAllocation[]
    asOfTimestamp: string
  }
}

export function PortfolioExpandedModal({
  isOpen,
  onClose,
  data,
}: PortfolioExpandedModalProps) {
  const { ethPrice } = useCurrency()

  const depositedBigInt = BigInt(data.stateBuckets.deposited)
  const entryQueueBigInt = BigInt(data.stateBuckets.entryQueue)
  const activeBigInt = BigInt(data.stateBuckets.active)
  const exitingBigInt = BigInt(data.stateBuckets.exiting)
  const withdrawableBigInt = BigInt(data.stateBuckets.withdrawable)

  const totalLifecycle =
    depositedBigInt + entryQueueBigInt + activeBigInt + exitingBigInt + withdrawableBigInt
  const earningRatio = totalLifecycle > 0n ? Number((activeBigInt * 10000n) / totalLifecycle) / 100 : 0
  const nonEarningBigInt = totalLifecycle - activeBigInt

  const totalUsd = formatUSD(data.totalValue, ethPrice)
  const totalEth = formatEther(data.totalValue)
  const change24hEth = data.change24h ? formatEther(data.change24h) : null
  const change24hIsPositive = data.change24h ? BigInt(data.change24h) >= 0n : true

  const updatedAt = new Date(data.asOfTimestamp)
  const secondsAgo = Math.floor((Date.now() - updatedAt.getTime()) / 1000)
  const timeAgoText =
    secondsAgo < 60
      ? `${secondsAgo}s ago`
      : secondsAgo < 3600
      ? `${Math.floor(secondsAgo / 60)}m ago`
      : `${Math.floor(secondsAgo / 3600)}h ago`

  const sortedCustodians = [...data.custodianBreakdown].sort((a, b) =>
    Number(BigInt(b.value) - BigInt(a.value))
  )

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border-border bg-card p-0 data-[state=closed]:animate-modal-out data-[state=open]:animate-modal-in">
        <DialogHeader className="space-y-0 border-b border-border px-6 pb-4 pt-5">
          <div className="flex items-center justify-between pr-8">
            <div>
              <DialogTitle id="portfolio-modal-title" className="text-xs uppercase tracking-wider text-muted-foreground">
                Portfolio Composition
              </DialogTitle>
              <div className="mt-2">
                <span className="tabular-nums text-2xl font-bold text-foreground">
                  {totalEth}
                  <span className="unit-symbol">ETH</span>
                </span>
                <span className="tabular-nums ml-2 text-lg text-muted-foreground">· {totalUsd}</span>
              </div>
              {change24hEth && (
                <p
                  className={`tabular-nums mt-1 text-sm font-medium ${
                    change24hIsPositive ? 'text-success' : 'text-destructive'
                  }`}
                >
                  {change24hIsPositive ? '+' : ''}
                  {change24hEth}
                  <span className="unit-symbol">ETH</span> (24h)
                </p>
              )}
              <DialogDescription className="sr-only">
                Custodian allocation and current stake lifecycle status.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-pulse-live rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="text-xs font-medium text-success">Live</span>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-4">
          {sortedCustodians.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-auto pb-2 text-xs uppercase tracking-wider">Custodian</TableHead>
                  <TableHead className="h-auto pb-2 text-right text-xs uppercase tracking-wider">ETH</TableHead>
                  <TableHead className="h-auto pb-2 text-right text-xs uppercase tracking-wider">%</TableHead>
                  <TableHead className="h-auto pb-2 text-right text-xs uppercase tracking-wider">APY</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCustodians.map((custodian) => {
                  const custodianEth = formatEther(custodian.value)
                  const custodianApy = (custodian.trailingApy30d * 100).toFixed(2)
                  const percentFormatted = (custodian.percentage * 100).toFixed(1)

                  return (
                    <TableRow key={custodian.custodianId} className="hover:bg-transparent">
                      <TableCell className="py-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 w-2 flex-shrink-0 rounded-full"
                            style={{ backgroundColor: getCustodianColor(custodian.custodianName) }}
                          />
                          <span className="text-foreground">{custodian.custodianName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="tabular-nums py-2 text-right text-foreground">
                        {custodianEth}
                      </TableCell>
                      <TableCell className="tabular-nums py-2 text-right text-muted-foreground">
                        {percentFormatted}%
                      </TableCell>
                      <TableCell className="tabular-nums py-2 text-right text-success">
                        {custodianApy}%
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">No custodian data available</p>
          )}
        </div>

        <div className="border-y border-border bg-muted px-6 py-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Stake Status</h3>
            <span className="tabular-nums text-sm font-medium text-foreground">
              {earningRatio.toFixed(1)}% Active
            </span>
          </div>

          <div className="flex h-2 overflow-hidden rounded-full bg-muted">
            <div className="bg-primary transition-all duration-300" style={{ width: `${earningRatio}%` }} />
            <div
              className="bg-apricot transition-all duration-300"
              style={{ width: `${100 - earningRatio}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span className="tabular-nums">
              <span className="mr-1 inline-block h-2 w-2 rounded bg-primary" />
              {formatNumber(Number(activeBigInt) / 1e18, 2)}
              <span className="unit-symbol">ETH</span> earning
            </span>
            <span className="tabular-nums">
              <span className="mr-1 inline-block h-2 w-2 rounded bg-apricot" />
              {formatNumber(Number(nonEarningBigInt) / 1e18, 2)}
              <span className="unit-symbol">ETH</span> pending
            </span>
          </div>
        </div>

        <div className="px-6 py-3">
          <p className="text-center text-xs text-muted-foreground">Updated {timeAgoText}</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
