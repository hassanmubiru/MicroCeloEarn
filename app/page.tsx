"use client"

import { useState, useEffect } from "react"
import { TaskMarketplace } from "@/components/task-marketplace"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { Header } from "@/components/header"
import { StatsBar } from "@/components/stats-bar"
import { OnboardingDialog } from "@/components/onboarding-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

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
