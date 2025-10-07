"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface TaskFiltersProps {
  selectedCategory: string
  selectedDifficulty: string
  onCategoryChange: (value: string) => void
  onDifficultyChange: (value: string) => void
}

export function TaskFilters({
  selectedCategory,
  selectedDifficulty,
  onCategoryChange,
  onDifficultyChange,
}: TaskFiltersProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 md:flex-row md:items-end">
      <div className="flex-1 space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger id="category">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Translation">Translation</SelectItem>
            <SelectItem value="Data Entry">Data Entry</SelectItem>
            <SelectItem value="Design">Design</SelectItem>
            <SelectItem value="Writing">Writing</SelectItem>
            <SelectItem value="Testing">Testing</SelectItem>
            <SelectItem value="Transcription">Transcription</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 space-y-2">
        <Label htmlFor="difficulty">Difficulty</Label>
        <Select value={selectedDifficulty} onValueChange={onDifficultyChange}>
          <SelectTrigger id="difficulty">
            <SelectValue placeholder="All difficulties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="Easy">Easy</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
