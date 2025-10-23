"use client"

import { Clock, DollarSign, Tag, TrendingUp, Loader2, CheckCircle, Star, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/lib/wallet-context"
import { acceptTask, submitTask, approveTask, type Task } from "@/lib/contract-interactions"
import { isContractConfigured } from "@/lib/celo-config"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

// Extended Task interface for display
interface DisplayTask extends Task {
  currency: string
  difficulty: string
  deadline: string
  status: string
}

interface TaskCardProps {
  task: DisplayTask
}

export function TaskCard({ task }: TaskCardProps) {
  const { isConnected, address } = useWallet()
  const { toast } = useToast()
  const [isAccepting, setIsAccepting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [rating, setRating] = useState(5)

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

  const handleSubmitTask = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to submit tasks.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await submitTask(task.id)

      toast({
        title: "Task submitted!",
        description: "Your task has been submitted for review.",
      })
    } catch (error: any) {
      console.error("[v0] Error submitting task:", error)
      toast({
        title: "Failed to submit task",
        description: error.message || "An error occurred while submitting the task.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApproveTask = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to approve tasks.",
        variant: "destructive",
      })
      return
    }

    setIsApproving(true)
    try {
      await approveTask(task.id, rating)

      toast({
        title: "Task approved!",
        description: `Payment of ${task.reward} ${task.currency} has been released to the worker.`,
      })
    } catch (error: any) {
      console.error("[v0] Error approving task:", error)
      toast({
        title: "Failed to approve task",
        description: error.message || "An error occurred while approving the task.",
        variant: "destructive",
      })
    } finally {
      setIsApproving(false)
    }
  }

  const renderTaskActions = () => {
    const isTaskPoster = address?.toLowerCase() === task.poster.toLowerCase()
    const isTaskWorker = address?.toLowerCase() === task.worker?.toLowerCase()

    // Debug logging
    console.log("[v0] TaskCard - Task status:", task.status, "Type:", typeof task.status)
    console.log("[v0] TaskCard - Full task:", task)

    // Task is open - anyone can accept
    if (task.status === "open") {
      return (
        <Button className="w-full" size="lg" onClick={handleAcceptTask} disabled={!isConnected || isAccepting || isTaskPoster}>
        {isAccepting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Accepting...
          </>
        ) : (
          "Accept Task"
        )}
        </Button>
      )
    }

    // Task is assigned - worker can submit
    if (task.status === "assigned") {
      if (isTaskWorker) {
        return (
          <Button className="w-full" size="lg" onClick={handleSubmitTask} disabled={!isConnected || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Submit for Review
              </>
            )}
          </Button>
        )
      } else {
        return (
          <div className="w-full text-center">
            <Badge variant="secondary" className="gap-1">
              <User className="h-3 w-3" />
              Assigned to Worker
            </Badge>
          </div>
        )
      }
    }

    // Task is in review - poster can approve
    if (task.status === "inreview") {
      if (isTaskPoster) {
        return (
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Rate the work:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`p-1 ${rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                  >
                    <Star className="h-4 w-4 fill-current" />
                  </button>
                ))}
              </div>
            </div>
            <Button className="w-full" size="lg" onClick={handleApproveTask} disabled={!isConnected || isApproving}>
              {isApproving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve & Pay
                </>
              )}
            </Button>
          </div>
        )
      } else {
        return (
          <div className="w-full text-center">
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              Awaiting Review
            </Badge>
          </div>
        )
      }
    }

    // Task is completed
    if (task.status === "completed") {
      return (
        <div className="w-full text-center">
          <Badge variant="default" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Completed
          </Badge>
        </div>
      )
    }

    // Default fallback
    return (
      <div className="w-full text-center">
        <Badge variant="outline">
          {task.status}
        </Badge>
      </div>
    )
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
        {renderTaskActions()}
      </CardFooter>
    </Card>
  )
}
