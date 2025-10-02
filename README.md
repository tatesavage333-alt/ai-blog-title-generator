# AI Blog Title Generator and Mini CMS

A powerful tool that generates creative blog title ideas from topics using OpenAI's GPT-3.5 Turbo and allows you to save your favorites in a mini content management system. Built with Next.js, TypeScript, and Tailwind CSS.

https://github.com/user-attachments/assets/d6606da9-9035-49b0-9c7b-200eb4dd9d0c

## Features

### Core Functionality
- **AI-Powered Title Generation**: Enter a topic and get 5 creative blog title suggestions
- **Smart Topic Processing**: Handles various topic formats (e.g., "online poker strategies", "healthy cooking tips")
- **Favorite Management**: Save your favorite titles with one click
- **Database Storage**: All saved titles are stored in SQLite database with Prisma ORM
- **Optional Categorization**: Add tags or categories to organize saved titles

### Bonus Features
- **Duplicate Avoidance**: Regenerate titles that avoid previously generated suggestions
- **CRUD Operations**: Edit and delete saved titles with full management capabilities
- **Search & Filter**: Find saved titles by content, tags, or categories
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Immediate UI feedback and updates

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **AI Integration**: OpenAI GPT-3.5 Turbo
- **Icons**: Lucide React
- **Styling**: Tailwind CSS v4

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm package manager
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-blog-title-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   DATABASE_URL="file:./dev.db"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Database Configuration
DATABASE_URL="file:./dev.db"
```

## Usage

### Generating Blog Titles

1. **Enter Your Topic**: Type your blog topic in the input field (e.g., "sustainable living tips")
2. **Generate Titles**: Click "Generate Titles" to get 5 AI-powered suggestions
3. **Review Suggestions**: Browse through the creative title options
4. **Save Favorites**: Click the heart icon to save titles you like
5. **Regenerate**: Click "Generate More" to get additional unique suggestions

### Managing Saved Titles

1. **View Saved Titles**: All saved titles appear in the "Saved Titles" section
2. **Add Categories**: Click "Edit" to add tags or categories to organize titles
3. **Search**: Use the search bar to find specific titles
4. **Filter**: Filter by categories or tags
5. **Edit/Delete**: Modify or remove saved titles as needed

## API Endpoints

### POST /api/titles/generate
Generate blog titles for a given topic

**Request Body:**
```json
{
  "topic": "sustainable living tips",
  "excludeIds": ["id1", "id2"] // Optional: IDs of titles to avoid duplicating
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "titles": [
      "10 Simple Sustainable Living Tips That Will Transform Your Daily Routine",
      "The Ultimate Guide to Eco-Friendly Living: Small Changes, Big Impact",
      "Sustainable Living Made Easy: Practical Tips for Beginners",
      "Green Living Revolution: How to Reduce Your Carbon Footprint Today",
      "Zero Waste Lifestyle: Essential Sustainable Living Tips for Modern Families"
    ]
  }
}
```

### GET /api/titles
Retrieve saved titles with optional search and filtering

**Query Parameters:**
- `search`: Search term to filter titles
- `category`: Filter by category/tag
- `limit`: Number of results to return (default: 50)

### POST /api/titles
Save a new title to the database

**Request Body:**
```json
{
  "title": "10 Simple Sustainable Living Tips That Will Transform Your Daily Routine",
  "topic": "sustainable living tips",
  "category": "lifestyle",
  "tags": ["sustainability", "eco-friendly", "lifestyle"]
}
```

### PUT /api/titles/[id]
Update an existing saved title

### DELETE /api/titles/[id]
Delete a saved title

## Design Notes

### Architecture Decisions

1. **Next.js Full-Stack Approach**: Unified frontend and backend for simplified development and deployment
2. **SQLite with Prisma**: Lightweight database perfect for this use case with type-safe operations
3. **Component-Based Architecture**:
   - `TitleGenerator`: Handles topic input and title generation
   - `SavedTitles`: Manages the list of saved titles with CRUD operations
   - `TitleCard`: Individual title display with save/edit/delete actions

4. **AI Integration Strategy**:
   - Structured prompts for consistent, high-quality title generation
   - Context-aware generation that considers the topic and avoids duplicates
   - Error handling for API failures with graceful fallbacks

5. **State Management**: React hooks for local state with optimistic updates for better UX

### UI/UX Decisions

1. **Clean, Professional Design**: Tailwind CSS for a modern, blog-focused aesthetic
2. **Intuitive Workflow**: Clear progression from topic → generation → saving → management
3. **Visual Feedback**: Loading states, success animations, and clear action buttons
4. **Responsive Layout**: Mobile-first design that works on all screen sizes
5. **Accessibility**: Proper ARIA labels, keyboard navigation, and screen reader support

### Performance Considerations

1. **Optimistic Updates**: UI updates immediately while API calls happen in background
2. **Efficient Queries**: Database queries optimized with proper indexing
3. **Client-Side Filtering**: Search and filter operations happen client-side for instant feedback
4. **Pagination Ready**: Limited results per request, ready for pagination if needed

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── titles/
│   │       ├── route.ts              # Main titles API
│   │       ├── generate/route.ts     # Title generation endpoint
│   │       └── [id]/route.ts         # Individual title operations
│   ├── globals.css                   # Global styles
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Main page
├── components/
│   ├── TitleGenerator.tsx            # Topic input and generation
│   ├── SavedTitles.tsx              # Saved titles management
│   └── TitleCard.tsx                # Individual title display
├── lib/
│   ├── db.ts                        # Prisma client setup
│   └── openai.ts                    # OpenAI integration
└── types/
    └── index.ts                     # TypeScript type definitions
```

## Development Workflow

1. **Database Changes**: Update `prisma/schema.prisma` then run `npx prisma db push`
2. **Type Generation**: Prisma automatically generates types after schema changes
3. **API Testing**: Use tools like Postman or curl to test API endpoints
4. **Component Development**: Hot reload with Next.js for rapid iteration

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Manual Deployment
1. Build the application: `npm run build`
2. Start production server: `npm start`
3. Ensure environment variables are set in production

## Limitations & Future Improvements

### Current Limitations
- Single AI model (GPT-3.5 Turbo)
- Basic categorization system
- No user authentication
- Limited export options

### Potential Improvements
- **Multi-Model Support**: Integration with Claude, Gemini, or other AI models
- **Advanced Categories**: Hierarchical category system with custom taxonomies
- **User Authentication**: Personal title libraries and team collaboration
- **Export Features**: Export titles to CSV, JSON, or integrate with popular CMS platforms
- **Analytics**: Track title performance and generation patterns
- **Bulk Operations**: Generate titles for multiple topics at once
- **Template System**: Custom prompt templates for different content types
- **Integration APIs**: Connect with WordPress, Ghost, or other blogging platforms

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the GPT-3.5 Turbo API
- Vercel for the Next.js framework and hosting platform
- Prisma for the excellent ORM and database tooling
- Tailwind CSS for the utility-first CSS framework
