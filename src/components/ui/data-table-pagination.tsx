'use client'

import { Button } from '@/components/ui/button'

interface DataTablePaginationProps {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function DataTablePagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: DataTablePaginationProps) {
  if (totalPages <= 1) return null

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  return (
    <div className="flex items-center justify-between" data-testid="pagination">
      <p className="text-sm text-muted-foreground">
        Showing {start} to {end} of {total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          data-testid="prev-page"
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          data-testid="next-page"
        >
          Next
        </Button>
      </div>
    </div>
  )
}
