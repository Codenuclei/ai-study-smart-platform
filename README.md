# StudyAI - AI-Powered Learning Platform

A modern, full-stack web application that leverages AI to help students learn smarter and faster. Upload your notes and get instant AI-generated summaries, quizzes, flashcards, and access to an intelligent study chatbot.

## Features

### Core Features
- **AI-Powered Summarization** - Automatically generate comprehensive summaries from your study materials
- **Smart Quiz Generation** - AI creates customized quizzes to test your knowledge
- **Intelligent Flashcards** - Spaced repetition flashcard decks for effective memorization
- **Study Chatbot** - Ask questions anytime and get instant help from your AI tutor
- **Learning Analytics** - Track your progress with detailed insights and statistics
- **User Authentication** - Secure account management with NextAuth.js

### Advanced Features
- Multiple study material formats (PDFs, text, images)
- Customizable difficulty levels for quizzes
- Progress tracking and learning streaks
- Personalized learning paths
- Export study materials and results

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS v4 with custom design tokens
- **Icons**: Lucide React
- **State Management**: SWR for data fetching and caching

### Backend
- **Runtime**: Next.js API Routes & Server Actions
- **Database**: Neon (Serverless PostgreSQL)
- **ORM**: Drizzle ORM
- **Authentication**: NextAuth.js 5

### AI & ML
- **AI SDK**: Vercel AI SDK 6
- **Model Support**: 
  - OpenAI GPT-4 Turbo (default)
  - Anthropic Claude
  - Google Gemini
  - Groq LLaMA
  - xAI Grok

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm/yarn
- Neon PostgreSQL database
- NextAuth secret key

### Installation

1. **Clone the repository**
```bash
git clone <repo-url>
cd study-ai
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.local.example .env.local
```

Fill in your environment variables:
```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# AI Configuration
AI_MODEL=openai/gpt-4-turbo
```

4. **Initialize the database**
```bash
node scripts/init-db.js
```

5. **Run the development server**
```bash
pnpm dev
```

6. **Open in browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
study-ai/
├── app/
│   ├── (auth)/                 # Authentication routes
│   │   ├── login/
│   │   └── register/
│   ├── api/
│   │   ├── auth/               # NextAuth API
│   │   ├── chat/               # Chatbot API
│   │   ├── materials/          # Study materials API
│   │   └── ai/                 # AI generation endpoints
│   ├── dashboard/              # Protected dashboard routes
│   │   ├── page.tsx
│   │   ├── materials/
│   │   ├── summaries/
│   │   ├── quizzes/
│   │   ├── flashcards/
│   │   ├── chatbot/
│   │   ├── analytics/
│   │   └── settings/
│   ├── layout.tsx
│   ├── globals.css
│   └── page.tsx                # Landing page
├── components/
│   ├── dashboard/              # Reusable dashboard components
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   ├── stat-card.tsx
│   │   └── activity-feed.tsx
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── db.ts                   # Database client
│   ├── schema.ts               # Drizzle schema
│   ├── auth.ts                 # NextAuth configuration
│   ├── auth-utils.ts           # Auth helper functions
│   └── utils.ts                # Utility functions
├── scripts/
│   ├── init-db.js              # Database initialization
│   └── setup-db.sql            # SQL schema
├── public/                     # Static assets
└── package.json
```

## Database Schema

### Main Tables
- **users** - User accounts and authentication
- **studyMaterials** - Uploaded study materials
- **summaries** - AI-generated summaries
- **quizzes** - Quiz sets with questions
- **flashcards** - Flashcard decks
- **chatMessages** - Chatbot conversation history
- **userProgress** - Learning progress tracking

## API Routes

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Study Materials
- `GET /api/materials` - List user's materials
- `POST /api/materials` - Upload new material

### AI Generation
- `POST /api/ai/summarize` - Generate summary
- `POST /api/ai/generate-quiz` - Generate quiz
- `POST /api/ai/generate-flashcards` - Generate flashcards

### Chat
- `POST /api/chat` - Chat with AI tutor

## Environment Variables

```env
# Required
DATABASE_URL                    # Neon PostgreSQL connection string
NEXTAUTH_SECRET                 # Secret for JWT signing
NEXTAUTH_URL                    # Application URL

# AI Configuration
AI_MODEL                        # AI model to use (default: openai/gpt-4-turbo)
AI_GATEWAY_API_KEY             # Optional: API key for specific providers

# Application
NEXT_PUBLIC_APP_URL            # Public application URL
NODE_ENV                       # Environment (development/production)
```

## Features Implementation Status

### ✅ Completed
- User authentication and authorization
- Study material upload and management
- AI summary generation (streaming)
- AI quiz generation (structured output)
- AI flashcard generation
- Interactive study chatbot
- Analytics dashboard
- User settings and preferences
- Dashboard UI with navigation
- Landing page

### 🚀 Ready for Enhancement
- Advanced filtering and search
- Collaboration features
- Export to PDF/Word
- Mobile app integration
- Advanced analytics
- Spaced repetition algorithm
- Custom AI model fine-tuning

## Deployment

### Deploy to Vercel

1. **Connect to GitHub**
```bash
git remote add origin <github-repo-url>
git push -u origin main
```

2. **Connect Vercel project**
- Go to [Vercel](https://vercel.com)
- Import your GitHub repository
- Set environment variables
- Click Deploy

3. **Database Setup**
- Neon database is automatically connected via DATABASE_URL
- Migrations run automatically on first deployment

### Production Checklist
- [ ] Set NEXTAUTH_SECRET to a strong random value
- [ ] Configure NEXTAUTH_URL to your domain
- [ ] Set AI_MODEL to production-ready model
- [ ] Enable HTTPS
- [ ] Configure custom domain
- [ ] Set up monitoring and logging

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow shadcn/ui component patterns
- Use server components by default
- Client components only for interactivity

### Database
- Use Drizzle ORM for all queries
- Always use parameterized queries
- Create migrations for schema changes
- Test queries in development first

### AI Integration
- Stream responses for better UX
- Handle errors gracefully
- Add timeout handling
- Cache generated content when possible

## Performance Optimization

- Server-side rendering for SEO
- Image optimization
- Code splitting and lazy loading
- Database query optimization
- Caching with SWR
- CDN for static assets

## Security

- Password hashing with bcryptjs
- CSRF protection with NextAuth
- SQL injection prevention with parameterized queries
- XSS protection with React
- HTTPS enforced in production
- Secure cookie settings

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
node -e "require('child_process').exec('psql \$DATABASE_URL -c SELECT 1')"
```

### AI Model Not Responding
- Check API keys in environment variables
- Verify model string is correct
- Check rate limits and usage

### Authentication Errors
- Ensure NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches deployment URL
- Clear browser cookies and try again

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

MIT License - feel free to use this project for learning and building

## Support

For issues and questions:
- Check the [troubleshooting section](#troubleshooting)
- Review API documentation
- Open an issue on GitHub

## Roadmap

- [ ] Real-time collaboration on materials
- [ ] Mobile app (iOS/Android)
- [ ] Advanced AI fine-tuning
- [ ] Social learning features
- [ ] Video lecture support
- [ ] Integration with learning management systems
- [ ] Advanced spaced repetition algorithm
- [ ] Achievement badges and gamification

---

Built with ❤️ using Next.js, AI SDK, and Vercel technologies.
