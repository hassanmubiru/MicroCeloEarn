"use client"

import { useState, useEffect } from "react"
import { TaskCard } from "@/components/task-card"
import { TaskFilters } from "@/components/task-filters"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { getOpenTasks, getTask, getUserAssignedTasks, type Task } from "@/lib/contract-interactions"
import { isContractConfigured } from "@/lib/celo-config"
import { useWallet } from "@/lib/wallet-context"
import { Loader2, AlertCircle, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TaskMarketplace() {
  const { address, isConnected } = useWallet()
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    // Mark as client-side rendered
    setIsClient(true)
  }, [])

  const refreshTasks = () => {
    setRefreshTrigger(prev => prev + 1)
  }

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
        
        // Get open tasks (available for everyone)
        const openTaskIds = await getOpenTasks()
        const openTasks = await Promise.all(openTaskIds.map((id) => getTask(id)))
        
        // Get user's assigned tasks (if connected)
        let assignedTasks: Task[] = []
        if (isConnected && address) {
          try {
            const assignedTaskIds = await getUserAssignedTasks(address)
            assignedTasks = await Promise.all(assignedTaskIds.map((id) => getTask(id)))
          } catch (err) {
            console.log("[v0] Could not fetch assigned tasks:", err)
            // Continue without assigned tasks if there's an error
          }
        }
        
        // Combine and deduplicate tasks
        const allTasks = [...openTasks, ...assignedTasks]
        const uniqueTasks = allTasks.filter((task, index, self) => 
          index === self.findIndex(t => t.id === task.id)
        )
        
        setTasks(uniqueTasks)
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
  }, [isClient, refreshTrigger, address, isConnected])

  const filteredTasks = tasks.filter((task) => {
    const categoryMatch = selectedCategory === "all" || task.category === selectedCategory
    return categoryMatch
  })

  const formattedTasks = filteredTasks.map((task) => ({
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
      ? task.worker 
      : undefined,
    workerDisplay: task.worker && task.worker !== "0x0000000000000000000000000000000000000000" 
      ? `${task.worker.slice(0, 6)}...${task.worker.slice(-4)}` 
      : undefined,
  }))

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
          <TaskCard key={task.id} task={task} onTaskUpdate={refreshTasks} />
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
