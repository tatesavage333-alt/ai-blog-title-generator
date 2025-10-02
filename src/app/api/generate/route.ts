import { NextRequest, NextResponse } from 'next/server'
import { generateBlogTitles } from '@/lib/openai'
import { prisma } from '@/lib/db'
import { TitleGenerationRequest, ApiResponse, GeneratedTitle } from '@/types'

// Rate limiting (simple in-memory store)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 10

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
  return ip
}

function checkRateLimit(key: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(key)

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false
  }

  userLimit.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(request)
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rate limit exceeded. Please try again later.' 
        } as ApiResponse<never>,
        { status: 429 }
      )
    }

    const body = await request.json() as TitleGenerationRequest
    const { topic, count = 5, excludeTitles = [] } = body

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

    if (topic.trim().length > 200) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Topic must be less than 200 characters' 
        } as ApiResponse<never>,
        { status: 400 }
      )
    }

    if (count < 1 || count > 10) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Count must be between 1 and 10' 
        } as ApiResponse<never>,
        { status: 400 }
      )
    }

    // Generate titles using OpenAI
    const generatedTitles = await generateBlogTitles({
      topic: topic.trim(),
      count,
      excludeTitles
    })

    // Save generation history
    try {
      await prisma.generationHistory.create({
        data: {
          topic: topic.trim(),
          titles: JSON.stringify(generatedTitles)
        }
      })
    } catch (dbError) {
      console.error('Failed to save generation history:', dbError)
      // Continue even if history saving fails
    }

    return NextResponse.json({
      success: true,
      data: generatedTitles
    } as ApiResponse<GeneratedTitle[]>)

  } catch (error) {
    console.error('Error in generate API:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate titles' 
      } as ApiResponse<never>,
      { status: 500 }
    )
  }
}
