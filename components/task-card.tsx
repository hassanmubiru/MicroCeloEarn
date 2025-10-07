"use client"

import { Clock, DollarSign, Tag, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/lib/wallet-context"
import { acceptTask } from "@/lib/contract-interactions"
import { isContractConfigured } from "@/lib/celo-config"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Task {
  id: number
  title: string
  description: string
  category: string
  reward: string
  currency: string
  deadline: string
  poster: string
  status: string
  difficulty: string
}

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  const { isConnected } = useWallet()
  const { toast } = useToast()
  const [isAccepting, setIsAccepting] = useState(false)

  const timeUntilDeadline = () => {
    const now = new Date()
    const deadline = new Date(task.deadline)
    const diff = deadline.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days}d ${hours}h`
    return `${hours}h`
  }

  const difficultyColor = {
    Easy: "bg-primary/10 text-primary border-primary/20",
    Medium: "bg-secondary/10 text-secondary-foreground border-secondary/20",
    Hard: "bg-destructive/10 text-destructive border-destructive/20",
  }

  const handleAcceptTask = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to accept tasks.",
        variant: "destructive",
      })
      return
    }

    if (!isContractConfigured()) {
      toast({
        title: "Contract not configured",
        description: "Please set the NEXT_PUBLIC_CONTRACT_ADDRESS environment variable and deploy the contract.",
        variant: "destructive",
      })
      return
    }

    setIsAccepting(true)
    try {
      await acceptTask(task.id)

      toast({
        title: "Task accepted!",
        description: "You can now start working on this task.",
      })
    } catch (error: any) {
      console.error("[v0] Error accepting task:", error)

      let errorMessage = error.message || "An error occurred while accepting the task."

      // Check for specific error patterns
      if (error.message?.includes("Contract address is set to your wallet address")) {
        errorMessage =
          "The contract address is incorrectly set to your wallet address. Please deploy the smart contract and update NEXT_PUBLIC_CONTRACT_ADDRESS with the deployed contract address."
      } else if (error.message?.includes("No contract found at this address")) {
        errorMessage =
          "No smart contract found at the configured address. Please deploy the MicroCeloEarn contract first using the deployment script."
      } else if (error.message?.includes("External transactions to internal accounts")) {
        errorMessage =
          "Invalid contract address. The address points to a wallet, not a smart contract. Please deploy the contract and use the correct contract address."
      }

      toast({
        title: "Failed to accept task",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsAccepting(false)
    }
  }

  return (
    <Card className="flex flex-col transition-all hover:shadow-lg">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="outline" className="gap-1">
            <Tag className="h-3 w-3" />
            {task.category}
          </Badge>
          <Badge variant="outline" className={difficultyColor[task.difficulty as keyof typeof difficultyColor]}>
            {task.difficulty}
          </Badge>
        </div>
        <CardTitle className="line-clamp-2 text-balance leading-snug">{task.title}</CardTitle>
        <CardDescription className="line-clamp-2 text-pretty">{task.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm font-medium">Reward</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">{task.reward}</span>
            <span className="text-sm font-medium text-muted-foreground">{task.currency}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{timeUntilDeadline()} left</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span className="font-mono text-xs">{task.poster}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button className="w-full" size="lg" onClick={handleAcceptTask} disabled={!isConnected || isAccepting}>
          {isAccepting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Accepting...
            </>
          ) : (
            "Accept Task"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
