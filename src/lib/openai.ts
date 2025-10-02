import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables')
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface TitleGenerationOptions {
  topic: string
  count?: number
  excludeTitles?: string[]
}

export interface GeneratedTitle {
  title: string
  reasoning?: string
}

export async function generateBlogTitles({
  topic,
  count = 5,
  excludeTitles = []
}: TitleGenerationOptions): Promise<GeneratedTitle[]> {
  try {
    const excludeText = excludeTitles.length > 0 
      ? `\n\nIMPORTANT: Do not generate any of these existing titles:\n${excludeTitles.map(title => `- ${title}`).join('\n')}`
      : ''

    const prompt = `Generate ${count} compelling, SEO-friendly blog post titles for the topic: "${topic}"

Requirements:
- Titles should be engaging and click-worthy
- Include relevant keywords naturally
- Vary the style (how-to, listicles, questions, etc.)
- Keep titles between 40-60 characters when possible
- Make them unique and creative${excludeText}

Return the response as a JSON array of objects with this format:
[
  {
    "title": "Your Blog Title Here",
    "reasoning": "Brief explanation of why this title works"
  }
]

Only return the JSON array, no additional text.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert content marketer and SEO specialist who creates compelling blog titles that drive engagement and traffic.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1000,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response
    const titles = JSON.parse(response) as GeneratedTitle[]
    
    // Validate the response format
    if (!Array.isArray(titles) || titles.length === 0) {
      throw new Error('Invalid response format from OpenAI')
    }

    // Ensure all titles have the required properties
    const validTitles = titles.filter(item => 
      item && typeof item.title === 'string' && item.title.trim().length > 0
    )

    if (validTitles.length === 0) {
      throw new Error('No valid titles generated')
    }

    return validTitles.slice(0, count)

  } catch (error) {
    console.error('Error generating blog titles:', error)
    
    // If JSON parsing fails, try to extract titles from plain text
    if (error instanceof SyntaxError) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert content marketer who creates compelling blog titles.'
            },
            {
              role: 'user',
              content: `Generate ${count} compelling blog post titles for the topic: "${topic}". Return only the titles, one per line.${excludeTitles.length > 0 ? `\n\nAvoid these existing titles:\n${excludeTitles.join('\n')}` : ''}`
            }
          ],
          temperature: 0.8,
          max_tokens: 500,
        })

        const response = completion.choices[0]?.message?.content
        if (!response) {
          throw new Error('No response from OpenAI fallback')
        }

        const titles = response
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .map(title => ({
            title: title.replace(/^\d+\.\s*/, '').replace(/^-\s*/, ''),
            reasoning: 'Generated with fallback method'
          }))

        return titles.slice(0, count)
      } catch (fallbackError) {
        console.error('Fallback generation also failed:', fallbackError)
        throw new Error('Failed to generate blog titles')
      }
    }
    
    throw error
  }
}

export default openai
