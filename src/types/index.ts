export interface BlogTitle {
  id: string
  topic: string
  title: string
  category?: string | null
  isFavorite: boolean
  createdAt: Date
  updatedAt: Date
}

export interface GenerationHistory {
  id: string
  topic: string
  titles: string // JSON array of generated titles
  createdAt: Date
}

export interface GeneratedTitle {
  title: string
  reasoning?: string
}

export interface TitleGenerationRequest {
  topic: string
  count?: number
  excludeTitles?: string[]
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface SaveTitleRequest {
  topic: string
  title: string
  category?: string
}

export interface UpdateTitleRequest {
  title?: string
  category?: string
  isFavorite?: boolean
}

export interface SearchFilters {
  search?: string
  category?: string
  isFavorite?: boolean
}
