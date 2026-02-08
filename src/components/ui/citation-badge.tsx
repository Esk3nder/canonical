import * as React from 'react'
import { cn } from '@/lib/utils'

export interface CitationBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  number: number
}

const CitationBadge = React.forwardRef<HTMLSpanElement, CitationBadgeProps>(
  ({ className, number, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex min-w-[18px] cursor-pointer items-center justify-center',
          'rounded-sm px-1 text-badge font-semibold leading-none',
          'bg-turquoise-100 text-turquoise-700',
          'transition-colors duration-fast hover:bg-turquoise-200',
          'align-super mx-0.5',
          className
        )}
        {...props}
      >
        {number}
      </span>
    )
  }
)
CitationBadge.displayName = 'CitationBadge'

export { CitationBadge }
