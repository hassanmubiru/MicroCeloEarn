"use client"

import { useState, useEffect } from "react"
import { TaskMarketplace } from "@/components/task-marketplace"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { Header } from "@/components/header"
import { StatsBar } from "@/components/stats-bar"
import { OnboardingDialog } from "@/components/onboarding-dialog"

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Mark as client-side rendered
    setIsClient(true)
    
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem("microceloearn_onboarding_completed")

    if (!hasCompletedOnboarding) {
      setShowOnboarding(true)
    }
  }, [])

  const handleOnboardingComplete = () => {
    localStorage.setItem("microceloearn_onboarding_completed", "true")
    setShowOnboarding(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <StatsBar />
      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Post a Task</h2>
            <p className="text-muted-foreground">Create tasks for others to complete and earn rewards</p>
            <div className="mt-4">
              <CreateTaskDialog />
            </div>
          </div>
          
          {/* Gas Fee Education Section */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-amber-100 p-2">
                <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-900 mb-2">Understanding Gas Fees</h3>
                <div className="space-y-2 text-sm text-amber-800">
                  <p><strong>For Workers:</strong> Accepting and submitting tasks requires small gas fees (~$0.01-0.05 CELO). These are blockchain transaction costs, not platform fees.</p>
                  <p><strong>For Task Posters:</strong> You pay the full task reward + 2.5% platform fee upfront. Workers only pay gas fees.</p>
                  <p><strong>Rewards:</strong> Workers receive the full task reward after completion - no deductions from your earnings!</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-8">
            <h2 className="text-2xl font-bold mb-4">Available Tasks</h2>
            <TaskMarketplace />
          </div>
        </div>
      </main>

      {isClient && (
        <OnboardingDialog open={showOnboarding} onOpenChange={setShowOnboarding} onComplete={handleOnboardingComplete} />
      )}
    </div>
  )
}
