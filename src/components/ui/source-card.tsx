'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

export interface SourceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  favicon?: string
  title: string
  domain: string
  snippet?: string
}

const SourceCard = React.forwardRef<HTMLDivElement, SourceCardProps>(
  ({ className, favicon, title, domain, snippet, ...props }, ref) => {
    const [open, setOpen] = React.useState(false)

    const content = (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-3 rounded-md border border-border bg-secondary px-4 py-3',
          'cursor-pointer transition-all duration-150 hover:bg-muted',
          className
        )}
        {...props}
      >
        {favicon && (
          <img
            src={favicon}
            alt=""
            className="h-5 w-5 shrink-0 rounded-sm"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-ui font-medium text-foreground">{title}</p>
          <p className="text-caption text-muted-foreground">{domain}</p>
        </div>
        {snippet && (
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-medium',
              open && 'rotate-180'
            )}
          />
        )}
      </div>
    )

    if (!snippet) return content

    return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>{content}</CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-1 rounded-md border border-border bg-secondary px-4 py-3">
            <p className="text-caption leading-relaxed text-muted-foreground">{snippet}</p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  }
)
SourceCard.displayName = 'SourceCard'

export { SourceCard }
