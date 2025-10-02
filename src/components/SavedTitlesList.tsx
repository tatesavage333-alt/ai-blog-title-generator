'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Edit2, Trash2, Heart, Tag, Copy, Check } from 'lucide-react'
import { BlogTitle } from '@/types'

interface SavedTitlesListProps {
  onRefresh: () => void
}

export default function SavedTitlesList({ onRefresh }: SavedTitlesListProps) {
  const [titles, setTitles] = useState<BlogTitle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ title: '', category: '' })
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({})

  const fetchTitles = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (selectedCategory) params.append('category', selectedCategory)
      if (showFavoritesOnly) params.append('isFavorite', 'true')

      const response = await fetch(`/api/titles?${params}`)
      const data = await response.json()

      if (data.success) {
        setTitles(data.data)
      } else {
        console.error('Failed to fetch titles:', data.error)
      }
    } catch (error) {
      console.error('Error fetching titles:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTitles()
  }, [searchTerm, selectedCategory, showFavoritesOnly])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this title?')) return

    try {
      const response = await fetch(`/api/titles/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setTitles(prev => prev.filter(title => title.id !== id))
        onRefresh()
      } else {
        console.error('Failed to delete title')
      }
    } catch (error) {
      console.error('Error deleting title:', error)
    }
  }

  const handleEdit = (title: BlogTitle) => {
    setEditingId(title.id)
    setEditForm({
      title: title.title,
      category: title.category || ''
    })
  }

  const handleSaveEdit = async (id: string) => {
    try {
      const response = await fetch(`/api/titles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editForm.title,
          category: editForm.category || null
        })
      })

      if (response.ok) {
        const data = await response.json()
        setTitles(prev => prev.map(title => 
          title.id === id ? data.data : title
        ))
        setEditingId(null)
        onRefresh()
      } else {
        console.error('Failed to update title')
      }
    } catch (error) {
      console.error('Error updating title:', error)
    }
  }

  const handleToggleFavorite = async (id: string, currentFavorite: boolean) => {
    try {
      const response = await fetch(`/api/titles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isFavorite: !currentFavorite
        })
      })

      if (response.ok) {
        const data = await response.json()
        setTitles(prev => prev.map(title => 
          title.id === id ? data.data : title
        ))
        onRefresh()
      } else {
        console.error('Failed to toggle favorite')
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const handleCopy = async (id: string, title: string) => {
    try {
      await navigator.clipboard.writeText(title)
      setCopiedStates(prev => ({ ...prev, [id]: true }))
      
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [id]: false }))
      }, 2000)
    } catch (error) {
      console.error('Failed to copy title:', error)
    }
  }

  const categories = Array.from(new Set(titles.map(t => t.category).filter(Boolean)))

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Saved Titles</h2>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search titles, topics, or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showFavoritesOnly
                ? 'bg-red-100 text-red-700 border border-red-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Heart className={`h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            Favorites Only
          </button>
        </div>
      </div>

      {titles.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Tag className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No saved titles yet</h3>
          <p className="text-gray-600">
            Generate some blog titles and save your favorites to see them here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {titles.map((title) => (
            <div
              key={title.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              {editingId === title.id ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Category (optional)"
                    value={editForm.category}
                    onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(title.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {title.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Topic: {title.topic}</span>
                        {title.category && (
                          <span className="bg-gray-100 px-2 py-1 rounded-full">
                            {title.category}
                          </span>
                        )}
                        <span>{new Date(title.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleFavorite(title.id, title.isFavorite)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        title.isFavorite
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${title.isFavorite ? 'fill-current' : ''}`} />
                      {title.isFavorite ? 'Favorited' : 'Add to Favorites'}
                    </button>

                    <button
                      onClick={() => handleEdit(title)}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </button>

                    <button
                      onClick={() => handleCopy(title.id, title.title)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        copiedStates[title.id]
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {copiedStates[title.id] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copiedStates[title.id] ? 'Copied!' : 'Copy'}
                    </button>

                    <button
                      onClick={() => handleDelete(title.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
