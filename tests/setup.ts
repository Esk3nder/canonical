import '@testing-library/jest-dom'
import * as React from 'react'
import { vi } from 'vitest'

// Radix Select expects pointer-capture APIs that JSDOM does not implement.
if (!HTMLElement.prototype.hasPointerCapture) {
  HTMLElement.prototype.hasPointerCapture = () => false
}

if (!HTMLElement.prototype.setPointerCapture) {
  HTMLElement.prototype.setPointerCapture = () => {}
}

if (!HTMLElement.prototype.releasePointerCapture) {
  HTMLElement.prototype.releasePointerCapture = () => {}
}

if (!HTMLElement.prototype.scrollIntoView) {
  HTMLElement.prototype.scrollIntoView = () => {}
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  globalThis.ResizeObserver = ResizeObserver
}

// Recharts ResponsiveContainer depends on layout measurements not available in JSDOM.
vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')

  const ResponsiveContainer = ({ children }: { children: React.ReactNode }) => {
    const width = 800
    const height = 200

    if (typeof children === 'function') {
      return (children as (width: number, height: number) => React.ReactNode)(width, height)
    }

    if (React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement, { width, height })
    }

    return React.createElement(React.Fragment, null, children)
  }

  return {
    ...actual,
    ResponsiveContainer,
  }
})

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))
