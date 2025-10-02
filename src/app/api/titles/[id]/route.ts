import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { UpdateTitleRequest, ApiResponse, BlogTitle } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const title = await prisma.blogTitle.findUnique({
      where: { id }
    })

    if (!title) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Title not found' 
        } as ApiResponse<never>,
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: title
    } as ApiResponse<BlogTitle>)

  } catch (error) {
    console.error('Error fetching title:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch title' 
      } as ApiResponse<never>,
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json() as UpdateTitleRequest
    const { title, category, isFavorite } = body

    // Check if title exists
    const existingTitle = await prisma.blogTitle.findUnique({
      where: { id }
    })

    if (!existingTitle) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Title not found' 
        } as ApiResponse<never>,
        { status: 404 }
      )
    }

    // Validation
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Title must be a non-empty string' 
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
    }

    if (category !== undefined && category !== null) {
      if (typeof category !== 'string' || category.trim().length > 50) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Category must be a string with less than 50 characters' 
          } as ApiResponse<never>,
          { status: 400 }
        )
      }
    }

    // Build update data
    const updateData: any = {}
    if (title !== undefined) updateData.title = title.trim()
    if (category !== undefined) updateData.category = category?.trim() || null
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite

    // Update title
    const updatedTitle = await prisma.blogTitle.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      data: updatedTitle,
      message: 'Title updated successfully'
    } as ApiResponse<BlogTitle>)

  } catch (error) {
    console.error('Error updating title:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update title' 
      } as ApiResponse<never>,
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if title exists
    const existingTitle = await prisma.blogTitle.findUnique({
      where: { id }
    })

    if (!existingTitle) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Title not found' 
        } as ApiResponse<never>,
        { status: 404 }
      )
    }

    // Delete title
    await prisma.blogTitle.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Title deleted successfully'
    } as ApiResponse<never>)

  } catch (error) {
    console.error('Error deleting title:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete title' 
      } as ApiResponse<never>,
      { status: 500 }
    )
  }
}
