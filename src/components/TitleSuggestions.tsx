'use client'

import { useState } from 'react'
import { Heart, Copy, Tag, Check, RefreshCw } from 'lucide-react'
import { GeneratedTitle } from '@/types'

interface TitleSuggestionsProps {
  titles: GeneratedTitle[]
  topic: string
  onSave: (title: string, category?: string) => Promise<void>
  onRegenerate: () => Promise<void>
  isRegenerating: boolean
}

export default function TitleSuggestions({ 
  titles, 
  topic, 
  onSave, 
  onRegenerate,
  isRegenerating 
}: TitleSuggestionsProps) {
  const [savingStates, setSavingStates] = useState<Record<number, boolean>>({})
  const [savedStates, setSavedStates] = useState<Record<number, boolean>>({})
  const [copiedStates, setCopiedStates] = useState<Record<number, boolean>>({})
  const [categories, setCategories] = useState<Record<number, string>>({})
  const [showCategoryInput, setShowCategoryInput] = useState<Record<number, boolean>>({})

  const handleSave = async (index: number, title: string) => {
    setSavingStates(prev => ({ ...prev, [index]: true }))
    
    try {
      const category = categories[index]?.trim() || undefined
      await onSave(title, category)
      setSavedStates(prev => ({ ...prev, [index]: true }))
      
      // Reset saved state after 2 seconds
      setTimeout(() => {
        setSavedStates(prev => ({ ...prev, [index]: false }))
      }, 2000)
    } catch (error) {
      console.error('Failed to save title:', error)
    } finally {
      setSavingStates(prev => ({ ...prev, [index]: false }))
    }
  }

  const handleCopy = async (index: number, title: string) => {
    try {
      await navigator.clipboard.writeText(title)
      setCopiedStates(prev => ({ ...prev, [index]: true }))
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [index]: false }))
      }, 2000)
    } catch (error) {
      console.error('Failed to copy title:', error)
    }
  }

  const toggleCategoryInput = (index: number) => {
    setShowCategoryInput(prev => ({ ...prev, [index]: !prev[index] }))
  }

  const handleCategoryChange = (index: number, value: string) => {
    setCategories(prev => ({ ...prev, [index]: value }))
  }

  if (titles.length === 0) {
    return null
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Generated Titles</h2>
          <p className="text-gray-600 mt-1">
            Topic: <span className="font-medium">{topic}</span>
          </p>
        </div>
        <button
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700 rounded-lg transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
          {isRegenerating ? 'Generating...' : 'Generate More'}
        </button>
      </div>

      <div className="grid gap-4">
        {titles.map((titleData, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
                  {titleData.title}
                </h3>
                {titleData.reasoning && (
                  <p className="text-sm text-gray-600 mb-4">
                    <span className="font-medium">Why this works:</span> {titleData.reasoning}
                  </p>
                )}
                
                {/* Category Input */}
                {showCategoryInput[index] && (
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Add a category (optional)"
                      value={categories[index] || ''}
                      onChange={(e) => handleCategoryChange(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                      maxLength={50}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => handleSave(index, titleData.title)}
                disabled={savingStates[index]}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  savedStates[index]
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white'
                }`}
              >
                {savedStates[index] ? (
                  <>
                    <Check className="h-4 w-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4" />
                    {savingStates[index] ? 'Saving...' : 'Save'}
                  </>
                )}
              </button>

              <button
                onClick={() => toggleCategoryInput(index)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <Tag className="h-4 w-4" />
                Category
              </button>

              <button
                onClick={() => handleCopy(index, titleData.title)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  copiedStates[index]
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Copy className="h-4 w-4" />
                {copiedStates[index] ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
