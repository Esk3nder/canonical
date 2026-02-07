'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { CurrencyToggle } from '@/components/CurrencyToggle'
import { Button } from '@/components/ui/button'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-[var(--header-height)] shrink-0 items-center border-b bg-background">
      <div className="flex w-full items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="hidden text-xl font-bold text-foreground sm:inline">Canonical</span>
        </div>
        <div className="flex items-center space-x-2">
          <CurrencyToggle />
          <Button asChild>
            <a href="/signin">Sign In</a>
          </Button>
        </div>
      </div>
    </header>
  )
}
