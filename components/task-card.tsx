"use client"

import { Clock, DollarSign, Tag, TrendingUp, Loader2, CheckCircle, Star, User, AlertTriangle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWallet } from "@/lib/wallet-context"
import { acceptTask, submitTask, approveTask, estimateAcceptTaskGas, estimateSubmitTaskGas, verifyPaymentReceived, type Task, PaymentToken } from "@/lib/contract-interactions"
import { isContractConfigured } from "@/lib/celo-config"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { TaskCompletionDialog } from "@/components/task-completion-dialog"

// Extended Task interface for display
interface DisplayTask extends Task {
  currency: string
  difficulty: string
  deadline: string
  status: string
  workerDisplay?: string
}

interface TaskCardProps {
  task: DisplayTask
  onTaskUpdate?: () => void
}

export function TaskCard({ task, onTaskUpdate }: TaskCardProps) {
  const { isConnected, address } = useWallet()
  const { toast } = useToast()
  const [isAccepting, setIsAccepting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [rating, setRating] = useState(5)
  const [acceptGasCost, setAcceptGasCost] = useState<string>("~$0.01-0.05")
  const [submitGasCost, setSubmitGasCost] = useState<string>("~$0.01-0.05")
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)

  // Estimate gas costs when component mounts
  useEffect(() => {
    const estimateGasCosts = async () => {
      if (!isConnected || !isContractConfigured()) return
      
      try {
        // Estimate accept task gas
        const acceptEstimate = await estimateAcceptTaskGas(task.id)
        setAcceptGasCost(`~${parseFloat(acceptEstimate.costInCELO).toFixed(4)} CELO`)
        
        // Estimate submit task gas
        const submitEstimate = await estimateSubmitTaskGas(task.id)
        setSubmitGasCost(`~${parseFloat(submitEstimate.costInCELO).toFixed(4)} CELO`)
      } catch (error) {
        console.log("Gas estimation failed, using defaults:", error)
        // Keep default values
      }
    }

    estimateGasCosts()
  }, [isConnected, task.id])

  const timeUntilDeadline = () => {
    const now = new Date()
    const deadline = new Date(task.deadline)
    const diff = deadline.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days}d ${hours}h`
    return `${hours}h`
  }

  const handleCardClick = () => {
    const isTaskWorker = address?.toLowerCase() === task.worker?.toLowerCase()
    
    // Only open completion dialog for assigned tasks where user is the worker
    if (task.status === "assigned" && isTaskWorker) {
      setShowCompletionDialog(true)
    }
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
      
      // Refresh the task list after a short delay to ensure blockchain state is updated
      if (onTaskUpdate) {
        setTimeout(() => {
          onTaskUpdate()
        }, 2000)
      }
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
      
      // Refresh the task list after a short delay to ensure blockchain state is updated
      if (onTaskUpdate) {
        setTimeout(() => {
          onTaskUpdate()
        }, 2000)
      }
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

      // Verify payment was received
      const paymentToken = task.currency === "cUSD" ? PaymentToken.cUSD : PaymentToken.CELO
      const verification = await verifyPaymentReceived(
        task.worker || "",
        task.id,
        task.reward,
        paymentToken
      )

      if (verification.success) {
        toast({
          title: "Task approved and payment verified!",
          description: `Payment of ${task.reward} ${task.currency} has been successfully sent to the worker.`,
        })
      } else {
        toast({
          title: "Task approved but payment verification failed",
          description: `Task was approved but payment may not have been received. ${verification.message}`,
          variant: "destructive",
        })
      }
      
      // Refresh the task list after a short delay to ensure blockchain state is updated
      if (onTaskUpdate) {
        setTimeout(() => {
          onTaskUpdate()
        }, 2000)
      }
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

    // Task is open - anyone can accept
    if (task.status === "open") {
      return (
        <div className="w-full space-y-3">
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Gas Fee Notice:</strong> Accepting this task requires a small gas fee ({acceptGasCost}). 
              You'll earn the full reward after completing the task.
            </AlertDescription>
          </Alert>
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
        </div>
      )
    }

    // Task is assigned - worker can submit
    if (task.status === "assigned") {
      if (isTaskWorker) {
        return (
          <div className="w-full space-y-3">
            <div className="rounded-lg bg-green-50 p-3 text-center">
              <div className="flex items-center justify-center gap-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">You're working on this task!</span>
              </div>
              <p className="mt-1 text-sm text-green-600">
                Click on the task card to complete and submit your work.
              </p>
            </div>
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Submit Fee:</strong> Submitting your work requires a small gas fee ({submitGasCost}). 
                You'll receive the full reward after approval.
              </AlertDescription>
            </Alert>
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
          </div>
        )
      } else {
        return (
          <div className="w-full text-center">
            <Badge variant="secondary" className="gap-1">
              <User className="h-3 w-3" />
              Assigned to {task.workerDisplay || "Worker"}
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
      } else if (isTaskWorker) {
        return (
          <div className="w-full space-y-2">
            <div className="rounded-lg bg-blue-50 p-3 text-center">
              <div className="flex items-center justify-center gap-2 text-blue-700">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Work Submitted!</span>
              </div>
              <p className="mt-1 text-sm text-blue-600">
                Waiting for the task poster to review your work.
              </p>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                Awaiting Review
              </Badge>
            </div>
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
    <>
      <Card 
        className={`flex flex-col transition-all hover:shadow-lg ${
          task.status === "assigned" && address?.toLowerCase() === task.worker?.toLowerCase() 
            ? "cursor-pointer hover:shadow-xl" 
            : ""
        }`}
        onClick={handleCardClick}
      >
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
        
        {task.worker && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Worker: {task.workerDisplay || task.worker}</span>
          </div>
        )}
      </CardContent>

      <CardFooter>
        {renderTaskActions()}
      </CardFooter>
    </Card>

    {/* Task Completion Dialog */}
    <TaskCompletionDialog
      task={task}
      open={showCompletionDialog}
      onOpenChange={setShowCompletionDialog}
      onTaskUpdate={onTaskUpdate}
    />
    </>
  )
}
