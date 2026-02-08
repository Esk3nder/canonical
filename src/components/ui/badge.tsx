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
          'border-transparent bg-turquoise-100 text-turquoise-700 hover:bg-turquoise-200',
        warning:
          'border-transparent bg-apricot/20 text-terra-cotta hover:bg-apricot/30',
        danger:
          'border-transparent bg-warm-red/10 text-warm-red hover:bg-warm-red/20',
        active:
          'border-transparent bg-turquoise-100 text-turquoise-800 hover:bg-turquoise-200',
        pending:
          'border-transparent bg-apricot/20 text-terra-cotta hover:bg-apricot/30',
        slashed:
          'border-transparent bg-warm-red/10 text-warm-red hover:bg-warm-red/20',
        exited:
          'border-transparent bg-muted text-muted-foreground hover:bg-muted/80',
        critical:
          'border-transparent bg-warm-red text-white hover:bg-warm-red/90',
        high:
          'border-transparent bg-terra-cotta text-white hover:bg-terra-cotta/90',
        medium:
          'border-transparent bg-apricot text-offblack hover:bg-apricot/90',
        low:
          'border-transparent bg-plex-blue text-white hover:bg-plex-blue/90',
        info:
          'border-sky bg-sky/30 text-inky-blue hover:bg-sky/50',
        neutral:
          'border-transparent bg-inky-blue text-white hover:bg-inky-blue/90',
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
