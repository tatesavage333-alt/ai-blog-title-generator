import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { SaveTitleRequest, ApiResponse, BlogTitle, SearchFilters } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const isFavorite = searchParams.get('isFavorite')

    const filters: SearchFilters = {}
    if (search) filters.search = search
    if (category) filters.category = category
    if (isFavorite !== null) filters.isFavorite = isFavorite === 'true'

    // Build where clause
    const where: any = {}
    
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { topic: { contains: filters.search, mode: 'insensitive' } },
        { category: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    if (filters.category) {
      where.category = filters.category
    }

    if (filters.isFavorite !== undefined) {
      where.isFavorite = filters.isFavorite
    }

    const titles = await prisma.blogTitle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit results
    })

    return NextResponse.json({
      success: true,
      data: titles
    } as ApiResponse<BlogTitle[]>)

  } catch (error) {
    console.error('Error fetching titles:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch titles' 
      } as ApiResponse<never>,
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SaveTitleRequest
    const { topic, title, category } = body

    // Validation
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Topic is required and must be a non-empty string' 
        } as ApiResponse<never>,
        { status: 400 }
      )
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Title is required and must be a non-empty string' 
        } as ApiResponse<never>,
        { status: 400 }
      )
    }

    if (title.trim().length > 200) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Title must be less than 200 characters' 
        } as ApiResponse<never>,
        { status: 400 }
      )
    }

    if (category && category.trim().length > 50) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Category must be less than 50 characters' 
        } as ApiResponse<never>,
        { status: 400 }
      )
    }

    // Check for duplicate titles
    const existingTitle = await prisma.blogTitle.findFirst({
      where: {
        title: title.trim(),
        topic: topic.trim()
      }
    })

    if (existingTitle) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'This title has already been saved for this topic' 
        } as ApiResponse<never>,
        { status: 409 }
      )
    }

    // Create new title
    const newTitle = await prisma.blogTitle.create({
      data: {
        topic: topic.trim(),
        title: title.trim(),
        category: category?.trim() || null,
        isFavorite: true // Default to favorite when saving
      }
    })

    return NextResponse.json({
      success: true,
      data: newTitle,
      message: 'Title saved successfully'
    } as ApiResponse<BlogTitle>)

  } catch (error) {
    console.error('Error saving title:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save title' 
      } as ApiResponse<never>,
      { status: 500 }
    )
  }
}
