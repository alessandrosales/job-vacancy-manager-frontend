import * as React from "react"

import { Card, CardContent } from "~/components/ui/card"
import { cn } from "~/lib/utils"

type ListingTableCardProps = {
  children: React.ReactNode
  className?: string
}

/**
 * Card that fills remaining viewport height under a fixed header; only the inner area scrolls.
 */
export function ListingTableCard({ children, className }: ListingTableCardProps) {
  return (
    <Card
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden py-0",
        className
      )}
    >
      <CardContent className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden px-0 pb-0 pt-0">
        <div className="min-h-0 flex-1 overflow-auto px-4 pb-4 pt-4">
          {children}
        </div>
      </CardContent>
    </Card>
  )
}
