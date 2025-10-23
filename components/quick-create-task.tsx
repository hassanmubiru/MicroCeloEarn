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
import { isContractConfigured, DEFAULT_NETWORK } from "@/lib/celo-config"
import { useWallet } from "@/lib/wallet-context"
import { Loader2, Plus, AlertCircle, CheckCircle2, DollarSign, Zap } from "lucide-react"

export function QuickCreateTask() {
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

    // Check if cUSD is available on current network
    const isCUSDAvailable = DEFAULT_NETWORK.tokens.cUSD !== "0x0000000000000000000000000000000000000000"

    // Check if user is trying to use cUSD when it's not available
    if (formData.paymentToken === "0" && !isCUSDAvailable) {
      setError("cUSD is not available on this network. Please use CELO instead.")
      return
    }

    setIsSubmitting(true)

    try {
      await createTask(
        formData.title,
        formData.description,
        formData.category,
        formData.reward,
        PaymentToken.CELO, // Always use CELO for quick tasks
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
      console.error("[v0] Error creating quick task:", err)
      setError(err.message || "Failed to create task")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Quick task templates for easy creation
  const quickTemplates = [
    {
      title: "Quick Translation",
      description: "Translate 3 sentences from English to Spanish",
      category: "Translation",
      reward: "0.05"
    },
    {
      title: "Social Media Share",
      description: "Share our post on your social media",
      category: "Marketing",
      reward: "0.02"
    },
    {
      title: "Website Test",
      description: "Test our website and report any bugs",
      category: "Testing",
      reward: "0.03"
    }
  ]

  const applyTemplate = (template: typeof quickTemplates[0]) => {
    setFormData({
      ...formData,
      title: template.title,
      description: template.description,
      category: template.category,
      reward: template.reward,
    })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Quick Create Task (Low Cost)
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
            <AlertDescription className="text-green-600">Task created successfully!</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              placeholder="e.g., Quick Translation Task"
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
              rows={3}
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
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Testing">Testing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reward">Reward (CELO)</Label>
              <Input
                id="reward"
                type="number"
                step="0.01"
                min="0.01"
                max="0.5"
                placeholder="0.05"
                value={formData.reward}
                onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                required
              />
            </div>
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
                Create Quick Task
              </>
            )}
          </Button>
        </form>

        <div className="border-t pt-4">
          <p className="text-sm font-medium mb-2">Quick Templates:</p>
          <div className="grid gap-2">
            {quickTemplates.map((template, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="justify-start h-auto p-2"
                onClick={() => applyTemplate(template)}
              >
                <div className="text-left">
                  <div className="font-medium text-xs">{template.title}</div>
                  <div className="text-xs text-muted-foreground">{template.reward} CELO</div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
