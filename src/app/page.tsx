'use client'

import { useState, useRef } from 'react'
import { Lightbulb, BookOpen, Sparkles } from 'lucide-react'
import TopicForm from '@/components/TopicForm'
import TitleSuggestions from '@/components/TitleSuggestions'
import SavedTitlesList from '@/components/SavedTitlesList'
import { GeneratedTitle } from '@/types'

export default function Home() {
  const [generatedTitles, setGeneratedTitles] = useState<GeneratedTitle[]>([])
  const [currentTopic, setCurrentTopic] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<'generate' | 'saved'>('generate')
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const savedTitlesRef = useRef<{ onRefresh: () => void } | null>(null)

  const handleGenerate = async (topic: string) => {
    setIsGenerating(true)
    setError('')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, count: 5 }),
      })

      const data = await response.json()

      if (data.success) {
        setGeneratedTitles(data.data)
        setCurrentTopic(topic)
      } else {
        setError(data.error || 'Failed to generate titles')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerate = async () => {
    if (!currentTopic) return

    setIsRegenerating(true)
    setError('')

    try {
      // Get existing titles to avoid duplicates
      const existingTitles = generatedTitles.map(t => t.title)

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: currentTopic,
          count: 5,
          excludeTitles: existingTitles
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Add new titles to existing ones
        setGeneratedTitles(prev => [...prev, ...data.data])
      } else {
        setError(data.error || 'Failed to generate more titles')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleSaveTitle = async (title: string, category?: string) => {
    try {
      const response = await fetch('/api/titles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: currentTopic,
          title,
          category,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to save title')
      }

      // Refresh saved titles if we're on that tab
      setRefreshKey(prev => prev + 1)
    } catch (err) {
      throw err // Re-throw to be handled by the component
    }
  }

  const handleRefreshSavedTitles = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Lightbulb className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Blog Title Generator</h1>
              <p className="text-gray-600">Generate compelling blog titles with AI and save your favorites</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('generate')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'generate'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Generate Titles
              </div>
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'saved'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Saved Titles
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800">{error}</div>
          </div>
        )}

        {activeTab === 'generate' ? (
          <div className="space-y-8">
            <TopicForm onGenerate={handleGenerate} isLoading={isGenerating} />

            {generatedTitles.length > 0 && (
              <TitleSuggestions
                titles={generatedTitles}
                topic={currentTopic}
                onSave={handleSaveTitle}
                onRegenerate={handleRegenerate}
                isRegenerating={isRegenerating}
              />
            )}
          </div>
        ) : (
          <SavedTitlesList key={refreshKey} onRefresh={handleRefreshSavedTitles} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>AI Blog Title Generator - Powered by OpenAI GPT-3.5 Turbo</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
