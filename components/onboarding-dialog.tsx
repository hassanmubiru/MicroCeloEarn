"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Wallet, Coins, FileText, CheckCircle2, ArrowRight, ArrowLeft, Sparkles } from "lucide-react"

interface OnboardingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: () => void
}

const steps = [
  {
    title: "Welcome to MicroCeloEarn",
    description: "Earn cryptocurrency by completing simple micro-tasks",
    icon: Sparkles,
    content: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          MicroCeloEarn is a decentralized platform where you can earn cUSD or CELO by completing small digital tasks
          like translations, data entry, design work, and more.
        </p>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">Low Fees</p>
              <p className="text-sm text-muted-foreground">
                Only 2.5% platform fee, much lower than traditional platforms
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">Instant Payments</p>
              <p className="text-sm text-muted-foreground">Get paid immediately when your work is approved</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">Secure Escrow</p>
              <p className="text-sm text-muted-foreground">
                Payments are held in smart contracts until work is completed
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Set Up Your Wallet",
    description: "Connect a Celo wallet to get started",
    icon: Wallet,
    content: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          To use MicroCeloEarn, you need a cryptocurrency wallet that supports the Celo blockchain. We recommend:
        </p>
        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📱</span>
              <div className="flex-1">
                <p className="font-semibold">Valora (Recommended for Mobile)</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Easy-to-use mobile wallet designed for Celo. Download from App Store or Google Play.
                </p>
                <Button variant="link" className="mt-2 h-auto p-0 text-primary" asChild>
                  <a href="https://valoraapp.com" target="_blank" rel="noopener noreferrer">
                    Get Valora →
                  </a>
                </Button>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🦊</span>
              <div className="flex-1">
                <p className="font-semibold">MetaMask (For Desktop)</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Popular browser extension wallet. Add Celo network after installation.
                </p>
                <Button variant="link" className="mt-2 h-auto p-0 text-primary" asChild>
                  <a href="https://metamask.io" target="_blank" rel="noopener noreferrer">
                    Get MetaMask →
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Understanding Payments",
    description: "Learn about cUSD and CELO tokens",
    icon: Coins,
    content: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">MicroCeloEarn supports two types of payment tokens:</p>
        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <span className="font-bold text-primary">$</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold">cUSD (Celo Dollar)</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  A stablecoin pegged to the US Dollar. 1 cUSD = $1 USD. Great for predictable earnings.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/10">
                <Coins className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">CELO</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  The native token of the Celo blockchain. Value fluctuates with the market.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-muted p-3 text-sm">
          <p className="font-medium">Getting Started Funds</p>
          <p className="mt-1 text-muted-foreground">
            You can get free testnet tokens from the Celo Alfajores faucet to try the platform, or purchase tokens on
            exchanges like Coinbase.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "How It Works",
    description: "Start earning in 3 simple steps",
    icon: FileText,
    content: (
      <div className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              1
            </div>
            <div className="flex-1">
              <p className="font-semibold">Browse Available Tasks</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Explore the marketplace and find tasks that match your skills. Filter by category, reward amount, and
                deadline.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              2
            </div>
            <div className="flex-1">
              <p className="font-semibold">Accept & Complete Tasks</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Click "Accept Task" to claim it. Complete the work according to the instructions and submit it for
                review.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              3
            </div>
            <div className="flex-1">
              <p className="font-semibold">Get Paid Instantly</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Once the task poster approves your work, payment is automatically released to your wallet. No waiting!
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="flex items-center gap-2 font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            Pro Tip
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Build your reputation by completing tasks on time and with high quality. Higher ratings lead to more
            opportunities!
          </p>
        </div>
      </div>
    ),
  },
]

export function OnboardingDialog({ open, onOpenChange, onComplete }: OnboardingDialogProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
      onOpenChange(false)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const currentStepData = steps[currentStep]
  const Icon = currentStepData.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle>{currentStepData.title}</DialogTitle>
              <DialogDescription>{currentStepData.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <Progress value={progress} className="h-2" />

          <div className="min-h-[300px]">{currentStepData.content}</div>

          <div className="flex items-center justify-between gap-4">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>

            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? (
                <>
                  Get Started
                  <CheckCircle2 className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
