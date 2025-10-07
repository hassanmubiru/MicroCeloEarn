"use client"

import { TrendingUp, Users, DollarSign } from "lucide-react"

export function StatsBar() {
  return (
    <div className="border-b border-border bg-muted/30">
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs font-medium">Total Paid</span>
            </div>
            <p className="text-lg font-bold text-foreground md:text-2xl">$124.5K</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium">Active Workers</span>
            </div>
            <p className="text-lg font-bold text-foreground md:text-2xl">2,847</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">Tasks Today</span>
            </div>
            <p className="text-lg font-bold text-foreground md:text-2xl">1,234</p>
          </div>
        </div>
      </div>
    </div>
  )
}
