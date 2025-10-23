"use client"

import { useState, useEffect } from "react"
import { AdminAccessGuard } from "@/components/admin/admin-access-guard"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminStats } from "@/components/admin/admin-stats"
import { TasksTable } from "@/components/admin/tasks-table"
import { DisputesPanel } from "@/components/admin/disputes-panel"
import { UsersTable } from "@/components/admin/users-table"
import { TransactionsChart } from "@/components/admin/transactions-chart"
import { AdminSettings } from "@/components/admin/admin-settings"
import { AdminCreateTask } from "@/components/admin/admin-create-task"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminDashboard() {
  const [isMounted, setIsMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading admin dashboard...</div>
      </div>
    )
  }

  return (
    <AdminAccessGuard>
      <div className="min-h-screen bg-background">
        <AdminHeader />

        <main className="container mx-auto px-4 py-6 md:py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Monitor and manage the MicroCeloEarn platform</p>
          </div>

          <AdminStats />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="disputes">Disputes</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <TransactionsChart />
            </TabsContent>

            <TabsContent value="tasks" className="mt-6">
              <TasksTable />
            </TabsContent>

            <TabsContent value="users" className="mt-6">
              <UsersTable />
            </TabsContent>

            <TabsContent value="disputes" className="mt-6">
              <DisputesPanel />
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <AdminSettings />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AdminAccessGuard>
  )
}
