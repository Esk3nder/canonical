import * as React from 'react'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AnswerCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  animate?: boolean
}

const AnswerCard = React.forwardRef<HTMLDivElement, AnswerCardProps>(
  ({ className, label = 'Answer', animate = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative max-w-thread rounded-md border border-border bg-card p-5 shadow-sm',
          'border-l-[3px] border-l-primary',
          animate && 'animate-slide-up',
          className
        )}
        {...props}
      >
        <div className="mb-4 inline-flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-heading-4 font-semibold text-primary">{label}</span>
        </div>
        <div className="text-base leading-relaxed text-card-foreground [&_p]:mb-3">
          {children}
        </div>
      </div>
    )
  }
)
AnswerCard.displayName = 'AnswerCard'

export { AnswerCard }
