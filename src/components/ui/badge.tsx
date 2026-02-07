import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success:
          'border-transparent bg-success-50 text-success-700 hover:bg-success-50/80',
        warning:
          'border-transparent bg-warning-50 text-warning-700 hover:bg-warning-50/80',
        danger: 'border-transparent bg-danger-50 text-danger-700 hover:bg-danger-50/80',
        active:
          'border-transparent bg-green-100 text-green-800 hover:bg-green-100/80',
        pending:
          'border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80',
        slashed: 'border-transparent bg-red-100 text-red-800 hover:bg-red-100/80',
        exited: 'border-transparent bg-slate-100 text-slate-800 hover:bg-slate-100/80',
        critical: 'border-transparent bg-red-600 text-white hover:bg-red-600/90',
        high: 'border-transparent bg-orange-500 text-white hover:bg-orange-500/90',
        medium: 'border-transparent bg-yellow-500 text-white hover:bg-yellow-500/90',
        low: 'border-transparent bg-blue-500 text-white hover:bg-blue-500/90',
        info: 'border-blue-200 bg-blue-100 text-blue-800 hover:bg-blue-100/80',
        neutral: 'border-transparent bg-slate-400 text-white hover:bg-slate-400/90',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
