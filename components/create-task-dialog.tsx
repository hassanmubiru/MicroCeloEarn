"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWallet } from "@/lib/wallet-context"
import { createTask, type PaymentToken } from "@/lib/contract-interactions"
import { isContractConfigured, DEFAULT_NETWORK } from "@/lib/celo-config"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export function CreateTaskDialog() {
  const { isConnected } = useWallet()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Check if cUSD is available on current network
  const isCUSDAvailable = DEFAULT_NETWORK.tokens.cUSD !== "0x0000000000000000000000000000000000000000"
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    reward: "",
    paymentToken: isCUSDAvailable ? "0" : "1", // Default to CELO if cUSD not available
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

    setIsSubmitting(true)

    try {
      await createTask(
        formData.title,
        formData.description,
        formData.category,
        formData.reward,
        Number.parseInt(formData.paymentToken) as PaymentToken,
        Number.parseInt(formData.deadlineHours),
      )

      setSuccess(true)
      setTimeout(() => {
        setOpen(false)
        setFormData({
          title: "",
          description: "",
          category: "",
          reward: "",
          paymentToken: "0",
          deadlineHours: "24",
        })
        setSuccess(false)
      }, 2000)
    } catch (err: any) {
      console.error("[v0] Error creating task:", err)
      setError(err.message || "Failed to create task")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" disabled={!isConnected}>
          <Plus className="h-4 w-4" />
          Post a Task
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Post a New Task</DialogTitle>
          <DialogDescription>
            Create a micro-task and escrow payment. Workers will be paid automatically upon completion.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-primary bg-primary/10">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <AlertDescription className="text-primary">Task created successfully!</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              placeholder="e.g., Translate 500 words"
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
                required
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Translation">Translation</SelectItem>
                  <SelectItem value="Data Entry">Data Entry</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Writing">Writing</SelectItem>
                  <SelectItem value="Testing">Testing</SelectItem>
                  <SelectItem value="Transcription">Transcription</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Select
                value={formData.deadlineHours}
                onValueChange={(value) => setFormData({ ...formData, deadlineHours: value })}
              >
                <SelectTrigger id="deadline">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="48">2 days</SelectItem>
                  <SelectItem value="72">3 days</SelectItem>
                  <SelectItem value="168">1 week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reward">Reward Amount</Label>
              <Input
                id="reward"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="5.00"
                value={formData.reward}
                onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="token">Payment Token</Label>
              <Select
                value={formData.paymentToken}
                onValueChange={(value) => setFormData({ ...formData, paymentToken: value })}
              >
                <SelectTrigger id="token">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0" disabled={!isCUSDAvailable}>
                    cUSD (Stablecoin) {!isCUSDAvailable && "(Not available on this network)"}
                  </SelectItem>
                  <SelectItem value="1">CELO</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium">Payment Details</p>
            <div className="mt-2 space-y-1 text-muted-foreground">
              <div className="flex justify-between">
                <span>Task reward:</span>
                <span className="font-mono">
                  {formData.reward || "0.00"} {formData.paymentToken === "0" ? "cUSD" : "CELO"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Platform fee (2.5%):</span>
                <span className="font-mono">
                  {(Number.parseFloat(formData.reward || "0") * 0.025).toFixed(2)}{" "}
                  {formData.paymentToken === "0" ? "cUSD" : "CELO"}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-1 font-semibold text-foreground">
                <span>Total escrowed:</span>
                <span className="font-mono">
                  {(Number.parseFloat(formData.reward || "0") * 1.025).toFixed(2)}{" "}
                  {formData.paymentToken === "0" ? "cUSD" : "CELO"}
                </span>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Task...
              </>
            ) : (
              "Create Task & Escrow Payment"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
