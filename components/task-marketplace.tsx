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
  const [needsDeployment, setNeedsDeployment] = useState(false)

  useEffect(() => {
    async function fetchTasks() {
      if (!isContractConfigured()) {
        setLoading(false)
        setNeedsDeployment(true)
        return
      }

      try {
        setLoading(true)
        setError(null)
        setNeedsDeployment(false)
        const taskIds = await getOpenTasks()
        const taskDetails = await Promise.all(taskIds.map((id) => getTask(id)))
        setTasks(taskDetails)
      } catch (err) {
        console.error("[v0] Error fetching tasks:", err)
        const errorMessage = err instanceof Error ? err.message : String(err)
        if (errorMessage.includes("No contract found") || errorMessage.includes("deploy")) {
          setNeedsDeployment(true)
          setError(null)
        } else {
          setError("Failed to load tasks from blockchain")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()

    let interval: NodeJS.Timeout | null = null
    if (isContractConfigured() && !needsDeployment) {
      interval = setInterval(fetchTasks, 30000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [needsDeployment])

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
    status: "open",
    difficulty: "Medium",
  }))

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (needsDeployment) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Available Tasks
            </h1>
            <p className="mt-2 text-pretty text-muted-foreground">
              Browse and complete micro-tasks to earn cUSD or CELO
            </p>
          </div>
        </div>

        <div className="flex min-h-[500px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-8 text-center">
          <div className="rounded-full bg-primary/10 p-4">
            <Rocket className="h-12 w-12 text-primary" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-foreground">Smart Contract Setup Required</h2>
          <p className="mt-3 max-w-md text-pretty text-muted-foreground">
            To start using MicroCeloEarn with real blockchain data, you need to deploy the smart contract to Celo
            network first.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="gap-2" disabled>
              <Rocket className="h-4 w-4" />
              Smart Contract Already Deployed
            </Button>
            <Button asChild variant="outline" size="lg">
              <a
                href="https://github.com/yourusername/microceloearn#deployment"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Documentation
              </a>
            </Button>
          </div>
          <div className="mt-8 rounded-lg bg-background/50 p-4 text-left">
            <p className="text-sm font-medium text-foreground">Quick Start:</p>
            <ol className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>1. Get free testnet CELO from the faucet</li>
              <li>2. Deploy contract using Remix IDE</li>
              <li>3. Set contract address in environment variables</li>
              <li>4. Start earning with real blockchain transactions</li>
            </ol>
          </div>
        </div>
      </div>
    )
  }

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
