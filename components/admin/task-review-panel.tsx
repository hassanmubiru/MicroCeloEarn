"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  DollarSign, 
  Calendar,
  Star,
  Loader2,
  AlertTriangle
} from "lucide-react"
import { 
  getAllTasks, 
  approveTask, 
  TaskStatus, 
  type Task, 
  PaymentToken,
  verifyPaymentReceived 
} from "@/lib/contract-interactions"
import { isContractConfigured } from "@/lib/celo-config"
import { useWallet } from "@/lib/wallet-context"
import { useToast } from "@/hooks/use-toast"

export function TaskReviewPanel() {
  const { address, isConnected } = useWallet()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [approvingTask, setApprovingTask] = useState<number | null>(null)
  const [ratings, setRatings] = useState<Record<number, number>>({})

  useEffect(() => {
    async function fetchTasks() {
      if (!isContractConfigured()) {
        setLoading(false)
        return
      }

      try {
        const allTasks = await getAllTasks()
        // Filter for tasks that need review (InReview status)
        const reviewTasks = allTasks.filter(task => task.status === TaskStatus.InReview)
        setTasks(reviewTasks)
      } catch (error) {
        console.error("[v0] Error fetching tasks:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
    const interval = setInterval(fetchTasks, 180000) // Update every 3 minutes
    return () => clearInterval(interval)
  }, [])

  const handleApproveTask = async (taskId: number) => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to approve tasks.",
        variant: "destructive",
      })
      return
    }

    const rating = ratings[taskId] || 5
    setApprovingTask(taskId)

    try {
      await approveTask(taskId, rating)

      // Verify payment was received
      const task = tasks.find(t => t.id === taskId)
      if (task) {
        const paymentToken = task.paymentToken === 0 ? PaymentToken.cUSD : PaymentToken.CELO
        const verification = await verifyPaymentReceived(
          task.worker || "",
          taskId,
          task.reward,
          paymentToken
        )

        if (verification.success) {
          toast({
            title: "Task approved and payment verified!",
            description: `Payment of ${task.reward} ${task.paymentToken === 0 ? 'cUSD' : 'CELO'} has been successfully sent to the worker.`,
          })
        } else {
          toast({
            title: "Task approved but payment verification failed",
            description: `Task was approved but payment may not have been received. ${verification.message}`,
            variant: "destructive",
          })
        }
      }

      // Remove the approved task from the list
      setTasks(prev => prev.filter(t => t.id !== taskId))
      
    } catch (error: any) {
      console.error("[v0] Error approving task:", error)
      toast({
        title: "Failed to approve task",
        description: error.message || "An error occurred while approving the task.",
        variant: "destructive",
      })
    } finally {
      setApprovingTask(null)
    }
  }

  const handleRatingChange = (taskId: number, rating: number) => {
    setRatings(prev => ({ ...prev, [taskId]: rating }))
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task Review Panel</CardTitle>
          <CardDescription>Review and approve completed tasks</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task Review Panel</CardTitle>
          <CardDescription>Review and approve completed tasks</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No tasks pending review</p>
            <p className="text-sm text-muted-foreground mt-2">All submitted tasks have been reviewed</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Task Review Panel
          </CardTitle>
          <CardDescription>
            Review and approve completed tasks to release payments to workers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Only approve tasks after reviewing the submitted work. 
              Once approved, payment will be automatically released to the worker.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {tasks.map((task) => (
              <Card key={task.id} className="border-l-4 border-l-orange-500">
                <CardContent className="pt-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Task Details */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{task.title}</h3>
                          <p className="text-sm text-muted-foreground">Task #{task.id}</p>
                        </div>
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          In Review
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Worker:</span>
                          <span className="font-mono">
                            {task.worker?.slice(0, 6)}...{task.worker?.slice(-4)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Reward:</span>
                          <span className="font-semibold">
                            {task.reward} {task.paymentToken === 0 ? 'cUSD' : 'CELO'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Submitted:</span>
                          <span>{formatDate(task.createdAt)} at {formatTime(task.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Review Actions */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`rating-${task.id}`} className="text-sm font-medium">
                          Rate Worker Performance (1-5 stars)
                        </Label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleRatingChange(task.id, star)}
                              className={`p-1 rounded ${
                                (ratings[task.id] || 5) >= star
                                  ? 'text-yellow-500'
                                  : 'text-gray-300'
                              }`}
                            >
                              <Star className="h-5 w-5 fill-current" />
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Current rating: {ratings[task.id] || 5} stars
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApproveTask(task.id)}
                          disabled={approvingTask === task.id || !isConnected}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          {approvingTask === task.id ? (
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
                    </div>
                  </div>

                  {/* Task Description */}
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-2">Task Description:</h4>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
