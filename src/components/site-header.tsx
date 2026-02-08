'use client'

import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-[var(--header-height)] shrink-0 items-center border-b bg-background">
      <div className="flex w-full items-center justify-between px-4">
        <span className="text-xl font-bold text-foreground">Canonical</span>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Button asChild>
            <a href="/signin">Sign In</a>
          </Button>
        </div>
      </div>
    </header>
  )
}
