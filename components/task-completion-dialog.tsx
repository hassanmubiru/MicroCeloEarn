"use client"

import { useState } from "react"
import { CheckCircle, Loader2, Upload, FileText, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/lib/wallet-context"
import { submitTask, type Task } from "@/lib/contract-interactions"
import { useToast } from "@/hooks/use-toast"

interface TaskCompletionDialogProps {
  task: Task & { currency: string; deadline: string; status: string }
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskUpdate?: () => void
}

export function TaskCompletionDialog({ task, open, onOpenChange, onTaskUpdate }: TaskCompletionDialogProps) {
  const { isConnected } = useWallet()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [workDescription, setWorkDescription] = useState("")
  const [attachments, setAttachments] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setAttachments(prev => [...prev, ...files])
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to submit work.",
        variant: "destructive",
      })
      return
    }

    if (!workDescription.trim()) {
      setError("Please provide a description of your completed work.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await submitTask(task.id)
      
      toast({
        title: "Work submitted successfully!",
        description: "Your work has been submitted for review. You'll be paid after approval.",
      })

      // Reset form
      setWorkDescription("")
      setAttachments([])
      onOpenChange(false)
      
      // Refresh task list
      if (onTaskUpdate) {
        setTimeout(() => {
          onTaskUpdate()
        }, 2000)
      }
    } catch (error: any) {
      console.error("Error submitting work:", error)
      setError(error.message || "Failed to submit work. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Complete Task: {task.title}
          </DialogTitle>
          <DialogDescription>
            Submit your completed work for review. You'll be paid after the task poster approves your work.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Details */}
          <div className="rounded-lg border p-4 bg-muted/50">
            <h3 className="font-semibold mb-2">Task Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reward:</span>
                <span className="font-medium">{task.reward} {task.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deadline:</span>
                <span className="font-medium">{new Date(task.deadline).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="secondary">{task.status}</Badge>
              </div>
            </div>
          </div>

          {/* Original Task Description */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Original Task Description</Label>
            <div className="rounded-lg border p-3 bg-muted/30 text-sm">
              {task.description}
            </div>
          </div>

          {/* Work Submission Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="work-description" className="text-sm font-medium">
                Describe your completed work *
              </Label>
              <Textarea
                id="work-description"
                placeholder="Explain what you did, how you completed the task, and any relevant details..."
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Provide a clear description of your completed work. This helps the task poster understand what you delivered.
              </p>
            </div>

            {/* File Attachments */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Attach Files (Optional)</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 rounded-lg p-4 transition-colors"
                >
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload files or drag and drop
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Images, documents, or any relevant files
                  </span>
                </label>
              </div>

              {/* Attached Files */}
              {attachments.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Attached Files</Label>
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({formatFileSize(file.size)})
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !workDescription.trim()}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Work...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Submit for Review
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
