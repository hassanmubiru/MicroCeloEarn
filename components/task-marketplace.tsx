"use client"

import { useState, useEffect } from "react"
import { TaskCard } from "@/components/task-card"
import { TaskFilters } from "@/components/task-filters"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { getOpenTasks, getTask, type Task } from "@/lib/contract-interactions"
import { isContractConfigured } from "@/lib/celo-config"
import { Loader2, AlertCircle, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TaskMarketplace() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Mark as client-side rendered
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    async function fetchTasks() {
      if (!isContractConfigured()) {
        setLoading(false)
        setError("Contract not configured. Please check your environment variables.")
        return
      }

      try {
        setLoading(true)
        setError(null)
        const taskIds = await getOpenTasks()
        console.log("[v0] Open task IDs:", taskIds)
        const taskDetails = await Promise.all(taskIds.map((id) => getTask(id)))
        console.log("[v0] Task details:", taskDetails)
        setTasks(taskDetails)
      } catch (err) {
        console.error("[v0] Error fetching tasks:", err)
        const errorMessage = err instanceof Error ? err.message : String(err)
        
        // Handle specific error cases
        if (errorMessage.includes("No contract found")) {
          setError("Contract not found. Please check your network connection and try again.")
        } else if (errorMessage.includes("No wallet detected")) {
          setError("Please connect your wallet to continue.")
        } else if (errorMessage.includes("Contract not configured")) {
          setError("Contract configuration error. Please refresh the page.")
        } else {
          setError(`Failed to load tasks: ${errorMessage}`)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()

    let interval: NodeJS.Timeout | null = null
    if (isContractConfigured()) {
      interval = setInterval(fetchTasks, 30000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isClient])

  const filteredTasks = tasks.filter((task) => {
    const categoryMatch = selectedCategory === "all" || task.category === selectedCategory
    return categoryMatch
  })

  const formattedTasks = filteredTasks.map((task) => {
    const formattedTask = {
      id: task.id,
      title: task.title,
      description: task.description,
      category: task.category,
      reward: task.reward,
      currency: task.paymentToken === 0 ? "cUSD" : "CELO",
      deadline: new Date(task.deadline * 1000).toISOString(),
      poster: `${task.poster.slice(0, 6)}...${task.poster.slice(-4)}`,
      status: getTaskStatusString(task.status),
      difficulty: "Medium",
      worker: task.worker && task.worker !== "0x0000000000000000000000000000000000000000" 
        ? `${task.worker.slice(0, 6)}...${task.worker.slice(-4)}` 
        : undefined,
    }
    console.log("[v0] Formatted task:", formattedTask)
    return formattedTask
  })

  // Helper function to convert task status enum to string
  function getTaskStatusString(status: number): string {
    switch (status) {
      case 0: return "open"
      case 1: return "assigned"
      case 2: return "inreview"
      case 3: return "completed"
      case 4: return "cancelled"
      case 5: return "disputed"
      default: return "unknown"
    }
  }

  if (!isClient || loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Contract is deployed, show normal marketplace

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="mt-4 text-lg font-medium text-destructive">{error}</p>
        <p className="mt-2 text-sm text-muted-foreground">Please check your wallet connection and try again</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Available Tasks
          </h1>
          <p className="mt-2 text-pretty text-muted-foreground">Browse and complete micro-tasks to earn cUSD or CELO</p>
        </div>
        <CreateTaskDialog />
      </div>

      <TaskFilters
        selectedCategory={selectedCategory}
        selectedDifficulty={selectedDifficulty}
        onCategoryChange={setSelectedCategory}
        onDifficultyChange={setSelectedDifficulty}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {formattedTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      {formattedTasks.length === 0 && !loading && (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-lg font-medium text-muted-foreground">No tasks found</p>
          <p className="mt-2 text-sm text-muted-foreground">Try adjusting your filters or check back later</p>
        </div>
      )}
    </div>
  )
}
