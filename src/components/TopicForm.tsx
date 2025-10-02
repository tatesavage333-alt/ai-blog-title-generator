'use client'

import { useState } from 'react'
import { Loader2, Lightbulb } from 'lucide-react'

interface TopicFormProps {
  onGenerate: (topic: string) => Promise<void>
  isLoading: boolean
}

export default function TopicForm({ onGenerate, isLoading }: TopicFormProps) {
  const [topic, setTopic] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!topic.trim()) {
      setError('Please enter a topic')
      return
    }

    if (topic.trim().length > 200) {
      setError('Topic must be less than 200 characters')
      return
    }

    try {
      await onGenerate(topic.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate titles')
    }
  }

  const exampleTopics = [
    'Online poker strategies',
    'Sustainable living tips',
    'Remote work productivity',
    'Digital marketing trends',
    'Healthy meal prep ideas'
  ]

  const handleExampleClick = (exampleTopic: string) => {
    setTopic(exampleTopic)
    setError('')
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
            What topic would you like blog titles for?
          </label>
          <div className="relative">
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value)
                setError('')
              }}
              placeholder="e.g., online poker strategies, sustainable living tips..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
              disabled={isLoading}
              maxLength={200}
            />
            <div className="absolute right-3 top-3">
              <Lightbulb className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">
              {topic.length}/200 characters
            </span>
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !topic.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating Titles...
            </>
          ) : (
            <>
              <Lightbulb className="h-5 w-5" />
              Generate Blog Titles
            </>
          )}
        </button>
      </form>

      {/* Example Topics */}
      <div className="mt-6">
        <p className="text-sm text-gray-600 mb-3">Try these example topics:</p>
        <div className="flex flex-wrap gap-2">
          {exampleTopics.map((exampleTopic, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(exampleTopic)}
              disabled={isLoading}
              className="text-xs bg-gray-100 hover:bg-gray-200 disabled:hover:bg-gray-100 disabled:cursor-not-allowed text-gray-700 px-3 py-1 rounded-full transition-colors"
            >
              {exampleTopic}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
