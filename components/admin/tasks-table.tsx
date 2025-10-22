"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Loader2 } from "lucide-react"
import { getAllTasks, TaskStatus, type Task } from "@/lib/contract-interactions"
import { isContractConfigured } from "@/lib/celo-config"

export function TasksTable() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTasks() {
      if (!isContractConfigured()) {
        setLoading(false)
        return
      }

      try {
        const allTasks = await getAllTasks()
        setTasks(allTasks)
      } catch (error) {
        console.error("[v0] Error fetching tasks:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
    const interval = setInterval(fetchTasks, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusBadge = (status: TaskStatus) => {
    const statusMap: Record<
      TaskStatus,
      { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
    > = {
      [TaskStatus.Open]: { label: "Open", variant: "secondary" },
      [TaskStatus.Assigned]: { label: "Active", variant: "default" },
      [TaskStatus.InReview]: { label: "In Review", variant: "outline" },
      [TaskStatus.Completed]: { label: "Completed", variant: "outline" },
      [TaskStatus.Cancelled]: { label: "Cancelled", variant: "destructive" },
      [TaskStatus.Disputed]: { label: "Disputed", variant: "destructive" },
    }
    const { label, variant } = statusMap[status]
    return <Badge variant={variant}>{label}</Badge>
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
          <CardDescription>Monitor all tasks on the platform</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Tasks</CardTitle>
        <CardDescription>Monitor all tasks on the platform ({tasks.length} total)</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Poster</TableHead>
              <TableHead>Worker</TableHead>
              <TableHead>Reward</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-mono">#{task.id}</TableCell>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell className="font-mono text-sm">
                  {task.poster.slice(0, 6)}...{task.poster.slice(-4)}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {task.worker && task.worker !== "0x0000000000000000000000000000000000000000"
                    ? `${task.worker.slice(0, 6)}...${task.worker.slice(-4)}`
                    : "-"}
                </TableCell>
                <TableCell>
                  {task.reward} {task.paymentToken === 0 ? "cUSD" : "CELO"}
                </TableCell>
                <TableCell>{getStatusBadge(task.status)}</TableCell>
                <TableCell>{new Date(task.createdAt * 1000).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {tasks.length === 0 && (
          <div className="flex items-center justify-center p-8 text-muted-foreground">
            No tasks found on the blockchain
          </div>
        )}
      </CardContent>
    </Card>
  )
}
