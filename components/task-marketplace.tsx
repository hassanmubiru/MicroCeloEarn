"use client"

import { useState } from "react"
import { TaskCard } from "@/components/task-card"
import { TaskFilters } from "@/components/task-filters"
import { CreateTaskDialog } from "@/components/create-task-dialog"

// Mock data - will be replaced with blockchain data
const mockTasks = [
  {
    id: 1,
    title: "Translate 500 words from English to Spanish",
    description: "Need accurate translation of marketing content. Must be native Spanish speaker.",
    category: "Translation",
    reward: "5.00",
    currency: "cUSD",
    deadline: new Date(Date.now() + 86400000 * 2).toISOString(),
    poster: "0x1234...5678",
    status: "open",
    difficulty: "Easy",
  },
  {
    id: 2,
    title: "Data entry: 100 product listings",
    description: "Enter product information into spreadsheet. Details and format provided.",
    category: "Data Entry",
    reward: "8.50",
    currency: "cUSD",
    deadline: new Date(Date.now() + 86400000 * 3).toISOString(),
    poster: "0xabcd...efgh",
    status: "open",
    difficulty: "Easy",
  },
  {
    id: 3,
    title: "Create 3 social media graphics",
    description: "Design Instagram posts for product launch. Brand guidelines provided.",
    category: "Design",
    reward: "15.00",
    currency: "CELO",
    deadline: new Date(Date.now() + 86400000 * 5).toISOString(),
    poster: "0x9876...4321",
    status: "open",
    difficulty: "Medium",
  },
  {
    id: 4,
    title: "Write 3 blog post titles and descriptions",
    description: "Create engaging titles and meta descriptions for tech blog posts.",
    category: "Writing",
    reward: "6.00",
    currency: "cUSD",
    deadline: new Date(Date.now() + 86400000).toISOString(),
    poster: "0xdef0...1234",
    status: "open",
    difficulty: "Easy",
  },
  {
    id: 5,
    title: "Test mobile app and report bugs",
    description: "Test new mobile app on Android device. Document any issues found.",
    category: "Testing",
    reward: "10.00",
    currency: "cUSD",
    deadline: new Date(Date.now() + 86400000 * 4).toISOString(),
    poster: "0x5555...6666",
    status: "open",
    difficulty: "Medium",
  },
  {
    id: 6,
    title: "Transcribe 15-minute audio interview",
    description: "Transcribe English audio to text. Clear audio quality.",
    category: "Transcription",
    reward: "7.50",
    currency: "cUSD",
    deadline: new Date(Date.now() + 86400000 * 2).toISOString(),
    poster: "0x7777...8888",
    status: "open",
    difficulty: "Easy",
  },
]

export function TaskMarketplace() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")

  const filteredTasks = mockTasks.filter((task) => {
    const categoryMatch = selectedCategory === "all" || task.category === selectedCategory
    const difficultyMatch = selectedDifficulty === "all" || task.difficulty === selectedDifficulty
    return categoryMatch && difficultyMatch
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Available Tasks
          </h1>
          <p className="mt-2 text-pretty text-muted-foreground">Browse and complete micro-tasks to earn cUSD or CELO</p>
        </div>
        <CreateTaskDialog />
      </div>

      <TaskFilters
        selectedCategory={selectedCategory}
        selectedDifficulty={selectedDifficulty}
        onCategoryChange={setSelectedCategory}
        onDifficultyChange={setSelectedDifficulty}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-lg font-medium text-muted-foreground">No tasks found</p>
          <p className="mt-2 text-sm text-muted-foreground">Try adjusting your filters or check back later</p>
        </div>
      )}
    </div>
  )
}
