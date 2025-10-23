"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createTask, PaymentToken } from "@/lib/contract-interactions"
import { isContractConfigured } from "@/lib/celo-config"
import { useWallet } from "@/lib/wallet-context"
import { Loader2, Plus, AlertCircle, CheckCircle2, DollarSign } from "lucide-react"

export function AdminCreateTask() {
  const { isConnected } = useWallet()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    reward: "",
    deadlineHours: "24",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!isContractConfigured()) {
      setError("Contract not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS environment variable.")
      return
    }

    if (!isConnected) {
      setError("Please connect your wallet to create tasks.")
      return
    }

    setIsSubmitting(true)

    try {
      await createTask(
        formData.title,
        formData.description,
        formData.category,
        formData.reward,
        PaymentToken.CELO, // Always use CELO for admin tasks
        Number.parseInt(formData.deadlineHours),
      )

      setSuccess(true)
      setTimeout(() => {
        setFormData({
          title: "",
          description: "",
          category: "",
          reward: "",
          deadlineHours: "24",
        })
        setSuccess(false)
      }, 3000)
    } catch (err: any) {
      console.error("[v0] Error creating admin task:", err)
      setError(err.message || "Failed to create task")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Predefined low-cost task templates
  const taskTemplates = [
    {
      title: "Test Translation Task",
      description: "Translate a simple sentence from English to Spanish",
      category: "Translation",
      reward: "0.1"
    },
    {
      title: "Social Media Post",
      description: "Create a short social media post about Celo blockchain",
      category: "Content",
      reward: "0.05"
    },
    {
      title: "Data Entry Task",
      description: "Enter 10 contact details into a spreadsheet",
      category: "Data",
      reward: "0.02"
    },
    {
      title: "Logo Design",
      description: "Create a simple logo for a startup",
      category: "Design",
      reward: "0.15"
    },
    {
      title: "Website Review",
      description: "Review and provide feedback on a website",
      category: "Review",
      reward: "0.08"
    }
  ]

  const applyTemplate = (template: typeof taskTemplates[0]) => {
    setFormData({
      ...formData,
      title: template.title,
      description: template.description,
      category: template.category,
      reward: template.reward,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Admin Task (Low Cost)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">Admin task created successfully!</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                placeholder="e.g., Test Translation Task"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Provide clear instructions for the task..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Translation">Translation</SelectItem>
                    <SelectItem value="Content">Content</SelectItem>
                    <SelectItem value="Data">Data</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Review">Review</SelectItem>
                    <SelectItem value="Testing">Testing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline (hours)</Label>
                <Select
                  value={formData.deadlineHours}
                  onValueChange={(value) => setFormData({ ...formData, deadlineHours: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="6">6 hours</SelectItem>
                    <SelectItem value="24">24 hours</SelectItem>
                    <SelectItem value="72">3 days</SelectItem>
                    <SelectItem value="168">1 week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reward">Reward (CELO)</Label>
              <Input
                id="reward"
                type="number"
                step="0.01"
                min="0.01"
                max="1.0"
                placeholder="0.05"
                value={formData.reward}
                onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                required
              />
              <p className="text-sm text-muted-foreground">
                Admin tasks use low rewards (0.01 - 1.0 CELO) to bootstrap the platform
              </p>
            </div>

            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="font-medium">Payment Details</p>
              <div className="mt-2 space-y-1 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Task reward:</span>
                  <span className="font-mono">
                    {formData.reward || "0.00"} CELO
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Platform fee (2.5%):</span>
                  <span className="font-mono">
                    {(Number.parseFloat(formData.reward || "0") * 0.025).toFixed(3)} CELO
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-1 font-semibold text-foreground">
                  <span>Total required:</span>
                  <span className="font-mono">
                    {(Number.parseFloat(formData.reward || "0") * 1.025).toFixed(3)} CELO
                  </span>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting || !isConnected}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Task...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Admin Task
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Quick Task Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Use these pre-configured low-cost tasks to quickly populate the platform:
          </p>
          <div className="grid gap-2">
            {taskTemplates.map((template, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start h-auto p-3"
                onClick={() => applyTemplate(template)}
              >
                <div className="text-left">
                  <div className="font-medium">{template.title}</div>
                  <div className="text-sm text-muted-foreground">{template.description}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {template.category} • {template.reward} CELO
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
