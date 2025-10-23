"use client"

import { useState, useEffect } from "react"
import { TaskMarketplace } from "@/components/task-marketplace"
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
        <TaskMarketplace />
      </main>

      {isClient && (
        <OnboardingDialog open={showOnboarding} onOpenChange={setShowOnboarding} onComplete={handleOnboardingComplete} />
      )}
    </div>
  )
}
