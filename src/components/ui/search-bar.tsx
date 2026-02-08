'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { ArrowRight, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const searchBarVariants = cva(
  'relative flex w-full items-center border bg-background transition-all duration-150',
  {
    variants: {
      variant: {
        default: 'max-w-search rounded-lg border-border',
        compact: 'max-w-md rounded-[5px] border-border',
      },
      size: {
        default: 'h-12',
        sm: 'h-10',
        lg: 'h-14',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface SearchBarProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onSubmit'>,
    VariantProps<typeof searchBarVariants> {
  onSubmit?: (value: string) => void
  showShortcut?: boolean
}

const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      className,
      variant,
      size,
      onSubmit,
      showShortcut = true,
      placeholder = 'Search...',
      ...props
    },
    ref
  ) => {
    const [value, setValue] = React.useState('')
    const inputRef = React.useRef<HTMLInputElement>(null)

    React.useImperativeHandle(ref, () => inputRef.current!)

    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
          const target = e.target as HTMLElement
          if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
          e.preventDefault()
          inputRef.current?.focus()
        }
      }
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    const handleSubmit = () => {
      if (value.trim() && onSubmit) {
        onSubmit(value.trim())
      }
    }

    return (
      <div
        className={cn(
          searchBarVariants({ variant, size }),
          'focus-within:border-primary focus-within:shadow-focus-cyan',
          className
        )}
      >
        <Search className="ml-4 h-5 w-5 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit()
          }}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-3 py-3 text-body-lg text-foreground placeholder:text-muted-foreground focus:outline-none"
          {...props}
        />
        {showShortcut && !value && (
          <kbd className="mr-3 hidden rounded border border-border bg-muted px-1.5 py-0.5 text-badge font-medium text-muted-foreground sm:inline-block">
            /
          </kbd>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!value.trim()}
          className="mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all duration-150 hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    )
  }
)
SearchBar.displayName = 'SearchBar'

export { SearchBar, searchBarVariants }
