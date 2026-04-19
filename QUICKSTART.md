# StudyAI Quick Start Guide

Get StudyAI running in 5 minutes!

## Option 1: Local Development (Fastest)

### Step 1: Install Dependencies
```bash
pnpm install
```

### Step 2: Configure Environment
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your settings:
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
NEXTAUTH_SECRET=<generate-random-secret>
NEXTAUTH_URL=http://localhost:3000
AI_MODEL=openai/gpt-4-turbo
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### Step 3: Initialize Database
```bash
node scripts/init-db.js
```

### Step 4: Run Development Server
```bash
pnpm dev
```

### Step 5: Open in Browser
Visit [http://localhost:3000](http://localhost:3000)

---

## Option 2: Deploy to Vercel (Production)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial StudyAI setup"
git remote add origin https://github.com/yourusername/study-ai.git
git push -u origin main
```

### Step 2: Connect to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Add environment variables:
   - `DATABASE_URL` - Your Neon connection string
   - `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
   - `NEXTAUTH_URL` - Your Vercel domain
   - `AI_MODEL` - Your AI model choice

### Step 3: Deploy
Click "Deploy" and wait ~3 minutes for deployment

---

## First Steps in the App

### 1. Create Account
- Go to Sign Up page
- Enter email and password
- Click "Sign Up"

### 2. Upload Study Material
- Click "Upload Study Material" on dashboard
- Enter title and notes
- Click "Add Material"

### 3. Generate AI Content
- Click the magic wand icon
- Select what to generate (Summary, Quiz, Flashcards)
- View generated content

### 4. Study & Learn
- Take quizzes to test knowledge
- Practice with flashcards
- Chat with AI tutor for help

### 5. Track Progress
- Check analytics dashboard
- View learning streaks
- Monitor performance

---

## Configuration Options

### AI Model Selection
```env
# Fast & Free
AI_MODEL=openai/gpt-4-turbo

# High Quality
AI_MODEL=anthropic/claude-opus-4.6

# Fast & Efficient
AI_MODEL=google/gemini-flash-latest

# Ultra Fast
AI_MODEL=groq/llama-3.1-70b

# Advanced
AI_MODEL=xai/grok-beta
```

### Theme Configuration
- Light theme (default)
- Dark theme (auto-detect from system)
- Toggle in settings

### Notification Preferences
- Email notifications
- Quiz reminders
- Weekly digest

---

## Troubleshooting

### Port Already in Use
```bash
# Use different port
pnpm dev -- -p 3001
```

### Database Connection Error
```bash
# Test connection
psql "your-connection-string" -c "SELECT 1"

# Check environment variable
echo $DATABASE_URL
```

### Build Fails
```bash
# Clear cache and rebuild
pnpm clean
pnpm install
pnpm build
```

### Login Issues
```bash
# Clear cookies and try again
# Or use incognito mode
```

---

## Key Features to Try

### AI Summarization
1. Add study material
2. Click "Generate Summary"
3. Choose summary style (Comprehensive/Concise/Detailed)
4. Get instant summary

### Quiz Generation
1. Click "Generate Quiz" on material
2. Select difficulty level
3. Answer questions
4. View score and explanations

### Flashcard Decks
1. Click "Generate Flashcards"
2. View or download deck
3. Study with spaced repetition
4. Track mastery

### Study Chatbot
1. Go to "Study Chatbot"
2. Ask any study question
3. Get instant AI help
4. Save useful answers

### Analytics Dashboard
1. Go to "Analytics"
2. View study statistics
3. Check learning streaks
4. Monitor quiz performance

---

## Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | postgresql://user:pass@host:5432/db |
| NEXTAUTH_SECRET | Secret for JWT signing | <random-32-char-string> |
| NEXTAUTH_URL | Your application URL | http://localhost:3000 |
| AI_MODEL | AI model to use | openai/gpt-4-turbo |
| NODE_ENV | Environment (dev/prod) | development |

---

## Database Setup

### Prerequisites
- Neon account (free at [neon.tech](https://neon.tech))
- PostgreSQL client (optional)

### Get Connection String
1. Go to [Neon Console](https://console.neon.tech)
2. Create new project
3. Copy connection string
4. Add to `DATABASE_URL`

### Initialize Database
```bash
# Automatically creates all tables and indexes
node scripts/init-db.js
```

### Verify Setup
```bash
# List tables
psql "$DATABASE_URL" -c "\dt"

# Check schema
psql "$DATABASE_URL" -c "\d users"
```

---

## Performance Tips

### Frontend
- Use dark mode for reduced power consumption
- Enable browser caching
- Install PWA for offline support

### Backend
- Database indexes are pre-configured
- API responses are streamed
- Caching enabled on materials

### Database
- Queries optimized with indexes
- Connection pooling via Neon
- Regular backups recommended

---

## Security Best Practices

1. **Never commit `.env.local`** - Use `.gitignore`
2. **Use strong password** - Min 8 characters recommended
3. **Enable 2FA** - Available in settings
4. **Update regularly** - Check for security patches
5. **Backup data** - Export materials regularly

---

## File Structure Quick Reference

```
study-ai/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout
│   ├── auth/                 # Auth pages
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/            # Protected pages
│   │   ├── page.tsx
│   │   ├── materials/
│   │   ├── chatbot/
│   │   └── analytics/
│   └── api/                  # API endpoints
│       ├── auth/
│       ├── chat/
│       ├── materials/
│       └── ai/
├── components/               # Reusable components
│   ├── dashboard/
│   └── ui/
├── lib/                      # Utilities
│   ├── db.ts
│   ├── schema.ts
│   ├── auth.ts
│   └── utils.ts
├── scripts/                  # Setup scripts
│   └── init-db.js
└── public/                   # Static assets
```

---

## Next Steps

### Customize
- [ ] Add your branding/logo
- [ ] Customize colors in `globals.css`
- [ ] Update app name everywhere

### Extend Features
- [ ] Add social login (Google, GitHub)
- [ ] Implement team features
- [ ] Add more AI models
- [ ] Create mobile app

### Deploy to Production
- [ ] Follow DEPLOYMENT.md guide
- [ ] Set up custom domain
- [ ] Enable monitoring
- [ ] Configure backups

---

## Getting Help

### Documentation
- 📖 [README.md](./README.md) - Full documentation
- 🚀 [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- 📋 [BUILD_SUMMARY.md](./BUILD_SUMMARY.md) - What was built

### Resources
- [Next.js Docs](https://nextjs.org/docs)
- [Neon Docs](https://neon.tech/docs)
- [Vercel Docs](https://vercel.com/docs)
- [AI SDK Docs](https://sdk.vercel.ai)

### Support
- Open issues on GitHub
- Check existing issues first
- Provide detailed error messages

---

## Success! 🎉

You've successfully set up StudyAI!

**What to do next:**
1. Create an account
2. Upload some study material
3. Generate AI content
4. Try the chatbot
5. Check your analytics
6. Deploy to production!

---

**Happy Learning! 📚✨**

For detailed information, see [README.md](./README.md)
