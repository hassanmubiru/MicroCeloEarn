"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { getDisputedTasks, type Task } from "@/lib/contract-interactions"
import { isContractConfigured } from "@/lib/celo-config"

export function DisputesPanel() {
  const [disputes, setDisputes] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDisputes() {
      if (!isContractConfigured()) {
        setLoading(false)
        return
      }

      try {
        const disputedTasks = await getDisputedTasks()
        setDisputes(disputedTasks)
      } catch (error) {
        console.error("[v0] Error fetching disputes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDisputes()
    const interval = setInterval(fetchDisputes, 180000) // Update every 3 minutes
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Disputes</CardTitle>
          <CardDescription>Review and resolve disputes between users</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Active Disputes</CardTitle>
          <CardDescription>Review and resolve disputes between users ({disputes.length} active)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {disputes.length === 0 ? (
            <div className="flex items-center justify-center p-8 text-muted-foreground">No active disputes</div>
          ) : (
            disputes.map((dispute) => (
              <Card key={dispute.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <h3 className="font-semibold">Task #{dispute.id}</h3>
                        <Badge variant="destructive">Disputed</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{dispute.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {dispute.reward} {dispute.paymentToken === 0 ? "cUSD" : "CELO"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(dispute.createdAt * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Poster:</span>
                      <span className="ml-2 font-mono">
                        {dispute.poster.slice(0, 6)}...{dispute.poster.slice(-4)}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Worker:</span>
                      <span className="ml-2 font-mono">
                        {dispute.worker.slice(0, 6)}...{dispute.worker.slice(-4)}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Description:</span>
                      <span className="ml-2">{dispute.description}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="default" className="flex-1">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Resolve for Worker
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      <XCircle className="h-4 w-4 mr-2" />
                      Resolve for Poster
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
