# StudyAI Deployment Guide

Complete guide to deploying StudyAI to production on Vercel.

## Prerequisites

- Vercel account (free or pro)
- GitHub account
- Neon PostgreSQL database
- AI model API key (OpenAI, Anthropic, etc.)

## Step 1: Prepare Your Code

### 1.1 Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit: StudyAI platform"
```

### 1.2 Create GitHub Repository
1. Go to [GitHub.com](https://github.com)
2. Create new repository named `study-ai`
3. Push local code:
```bash
git remote add origin https://github.com/yourusername/study-ai.git
git branch -M main
git push -u origin main
```

## Step 2: Set Up Database

### 2.1 Create Neon Project
1. Visit [Neon Console](https://console.neon.tech)
2. Create new project
3. Get connection string: `postgresql://user:password@host/database`
4. Keep this safe - you'll need it for deployment

### 2.2 Run Database Migration
```bash
# Locally first
DATABASE_URL="your-connection-string" node scripts/init-db.js

# Verify database created successfully
psql "your-connection-string" -c "\dt"
```

## Step 3: Deploy to Vercel

### 3.1 Import Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Select "Import Git Repository"
4. Find and import `study-ai` repository
5. Click "Import"

### 3.2 Configure Environment Variables
In the "Environment Variables" section, add:

```
DATABASE_URL=postgresql://user:password@host/database
NEXTAUTH_SECRET=<generate-random-string>
NEXTAUTH_URL=https://yourdomain.vercel.app
AI_MODEL=openai/gpt-4-turbo
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3.3 Configure Build Settings
- **Framework Preset**: Next.js
- **Build Command**: `pnpm run build`
- **Output Directory**: `.next`
- **Install Command**: `pnpm install`

### 3.4 Deploy
Click "Deploy" and wait for deployment to complete.

## Step 4: Post-Deployment Configuration

### 4.1 Run Database Migration on Production
```bash
# Connect to Vercel environment
vercel env pull .env.production.local

# Run migration
DATABASE_URL="production-url" node scripts/init-db.js
```

### 4.2 Custom Domain Setup
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration steps
4. Update NEXTAUTH_URL to your domain:
```
NEXTAUTH_URL=https://yourdomain.com
```

### 4.3 Set Production Environment Variables
Ensure all variables are set correctly in Vercel dashboard:
- Go to Settings → Environment Variables
- Verify all required variables are present
- Make sure values are correct for production

## Step 5: Security Checklist

### 5.1 Authentication Security
- [ ] NEXTAUTH_SECRET is strong (32+ character random string)
- [ ] NEXTAUTH_URL matches your domain exactly
- [ ] Session cookies are marked as Secure
- [ ] CORS properly configured

### 5.2 Database Security
- [ ] Database user has limited permissions
- [ ] Connection string uses SSL/TLS
- [ ] Backup enabled in Neon
- [ ] IP whitelisting configured if possible

### 5.3 API Security
- [ ] API keys stored in environment variables only
- [ ] Rate limiting configured
- [ ] Input validation enabled
- [ ] HTTPS enforced

## Step 6: Monitoring & Maintenance

### 6.1 Set Up Monitoring
1. Go to Project Settings → Monitoring
2. Enable error tracking
3. Configure alerting for critical errors

### 6.2 Enable Analytics
1. Vercel Analytics already integrated
2. View at Vercel Dashboard → Analytics

### 6.3 Regular Backups
```bash
# Backup Neon database
pg_dump "your-connection-string" > backup.sql

# Restore if needed
psql "your-connection-string" < backup.sql
```

## Troubleshooting

### Build Fails
- Check build logs in Vercel
- Ensure all environment variables are set
- Verify Node version compatibility

### Database Connection Errors
```bash
# Test connection
psql "your-connection-string" -c "SELECT 1"

# Check environment variable
echo $DATABASE_URL
```

### Authentication Issues
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches domain
- Clear browser cookies and try again
- Check NextAuth logs in Vercel

### AI Model Errors
- Verify API key is correct
- Check model string format
- Monitor API usage limits
- Test locally before deploying

## Performance Optimization

### 6.1 Enable Caching
```bash
# In .env.production
NEXT_PUBLIC_CACHE_TIME=3600
```

### 6.2 Enable Compression
- Vercel automatically enables gzip
- Configure in next.config.mjs if needed

### 6.3 Database Optimization
```sql
-- Create indexes for better performance
CREATE INDEX idx_materials_user_id ON study_materials(user_id);
CREATE INDEX idx_summaries_material_id ON summaries(material_id);
CREATE INDEX idx_quizzes_material_id ON quizzes(material_id);
```

## Scaling Considerations

### Database
- Monitor connection count
- Consider Neon Pro for higher limits
- Enable query logging for optimization

### API Rate Limiting
```typescript
// Example rate limiting middleware
import { rateLimit } from '@/lib/rate-limit'

export const middleware = rateLimit({
  interval: 60 * 1000, // 1 minute
  maxRequests: 100,
})
```

### Static Content
- Use Vercel CDN for static assets
- Configure proper cache headers
- Consider Vercel Blob for large files

## Updating Production

### Safe Deployment Workflow
```bash
# 1. Test locally
npm run dev

# 2. Build and test production build
npm run build
npm start

# 3. Push to main branch
git push origin main

# 4. Vercel auto-deploys
# Monitor at: vercel.com/dashboard

# 5. Test in production
curl https://yourdomain.com
```

### Rollback Plan
```bash
# View deployment history
vercel deployments

# Rollback to previous version
vercel rollback
```

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Neon Documentation](https://neon.tech/docs)
- [NextAuth.js Documentation](https://authjs.dev)

## Support & Monitoring

### Useful Links
- Vercel Dashboard: https://vercel.com/dashboard
- Neon Console: https://console.neon.tech
- GitHub Repository: https://github.com/yourusername/study-ai

### Contact
- GitHub Issues: Report bugs and feature requests
- Email Support: support@yourdomain.com
- Discord: Join community server

---

Last Updated: 2024
Next Review: Monthly
