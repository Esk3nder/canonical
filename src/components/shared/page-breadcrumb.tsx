import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem as BreadcrumbItemPrimitive,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import React from 'react'

interface BreadcrumbEntry {
  label: string
  href?: string
  testId?: string
}

interface PageBreadcrumbProps {
  items: BreadcrumbEntry[]
}

export function PageBreadcrumb({ items }: PageBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <React.Fragment key={`${index}-${item.href ?? item.label}`}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItemPrimitive>
                {isLast || !item.href ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.href} data-testid={item.testId}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItemPrimitive>
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
