"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, DollarSign, AlertCircle, Loader2, Calendar, CheckCircle, TrendingUp } from "lucide-react"
import { getPlatformStats } from "@/lib/contract-interactions"
import { isContractConfigured } from "@/lib/celo-config"

export function AdminStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeTasks: 0,
    totalVolume: "0",
    openDisputes: 0,
    tasksToday: 0,
    totalTasks: 0,
    completedTasks: 0,
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
          totalUsers: platformStats.totalUsers,
          activeTasks: platformStats.activeTasks,
          totalVolume: platformStats.totalVolume,
          openDisputes: platformStats.disputedTasks,
          tasksToday: platformStats.tasksToday,
          totalTasks: platformStats.totalTasks,
          completedTasks: platformStats.completedTasks,
        })
      } catch (error) {
        console.error("[v0] Error fetching platform stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.totalVolume}</div>
          <p className="text-xs text-muted-foreground">Completed task rewards</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Workers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Unique addresses</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasks Today</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.tasksToday}</div>
          <p className="text-xs text-muted-foreground">Created today</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Open Disputes</CardTitle>
          <AlertCircle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.openDisputes}</div>
          <p className="text-xs text-muted-foreground">Requires attention</p>
        </CardContent>
      </Card>
    </div>
  )
}
