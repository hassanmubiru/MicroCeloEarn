"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Users, DollarSign, Loader2 } from "lucide-react"
import { getPlatformStats } from "@/lib/contract-interactions"
import { isContractConfigured } from "@/lib/celo-config"

export function StatsBar() {
  const [stats, setStats] = useState({
    totalVolume: "0",
    totalUsers: 0,
    tasksToday: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      if (!isContractConfigured()) {
        setLoading(false)
        return
      }

      try {
        const platformStats = await getPlatformStats()
        setStats({
          totalVolume: platformStats.totalVolume,
          totalUsers: platformStats.totalUsers,
          tasksToday: platformStats.tasksToday,
        })
      } catch (error) {
        console.error("[v0] Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">Loading stats...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border-b border-border bg-muted/30">
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs font-medium">Total Paid</span>
            </div>
            <p className="text-lg font-bold text-foreground md:text-2xl">${stats.totalVolume}</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium">Active Workers</span>
            </div>
            <p className="text-lg font-bold text-foreground md:text-2xl">{stats.totalUsers.toLocaleString()}</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">Tasks Today</span>
            </div>
            <p className="text-lg font-bold text-foreground md:text-2xl">{stats.tasksToday}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
