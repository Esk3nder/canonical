'use client'

import * as React from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  language?: string
  code: string
}

const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(
  ({ className, language, code, ...props }, ref) => {
    const [copied, setCopied] = React.useState(false)

    const handleCopy = async () => {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }

    return (
      <div
        ref={ref}
        className={cn('overflow-hidden rounded-md border border-border', className)}
        {...props}
      >
        <div className="flex items-center justify-between border-b border-border bg-secondary px-4 py-2">
          <span className="text-caption text-muted-foreground">
            {language || 'code'}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-sm px-2 py-1 text-caption text-muted-foreground transition-colors duration-fast hover:bg-muted hover:text-foreground"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
        <div className="bg-offblack p-4 dark:bg-secondary">
          <pre className="overflow-x-auto">
            <code className="font-mono text-ui leading-relaxed text-off-white dark:text-foreground">
              {code}
            </code>
          </pre>
        </div>
      </div>
    )
  }
)
CodeBlock.displayName = 'CodeBlock'

export { CodeBlock }
