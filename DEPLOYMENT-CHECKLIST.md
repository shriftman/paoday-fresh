# 🚀 Deployment Checklist - Paoday CRM Phase 2

Use this checklist before deploying to production.

## ✅ Pre-Deployment

### Code Quality
- [x] TypeScript compilation passes (`npx tsc --noEmit`)
- [x] ESLint passes (minor warning acceptable)
- [x] Build succeeds (`npm run build`)
- [x] All components render without errors
- [x] No console errors in development

### Database
- [ ] Migration applied in production Supabase
- [ ] RLS policies enabled
- [ ] Sample data removed (optional)
- [ ] Indexes created
- [ ] Backup taken

### Environment
- [ ] Production `.env` configured
- [ ] Supabase URL correct
- [ ] Supabase anon key correct
- [ ] No development keys in production

### Testing
- [ ] Authentication flow tested
- [ ] Drag-and-drop tested
- [ ] All navigation links work
- [ ] Logout works
- [ ] Mobile responsive (basic)
- [ ] Different browsers tested

## 📋 Deployment Steps

### 1. Prepare Database

```sql
-- Connect to production Supabase
-- Run the migration:
-- supabase/migrations/001_create_deals_table.sql

-- Verify:
SELECT COUNT(*) FROM deals;
SELECT * FROM pg_policies WHERE tablename = 'deals';
```

### 2. Configure Vercel

```bash
# Login to Vercel
vercel login

# Deploy to preview
vercel

# Test preview URL
# Check all features work

# Deploy to production
vercel --prod
```

### 3. Set Environment Variables

In Vercel Dashboard:
1. Go to Project Settings
2. Click "Environment Variables"
3. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Select: Production, Preview, Development
5. Click "Save"

### 4. Verify Deployment

- [ ] Production URL loads
- [ ] Can signup new account
- [ ] Can login
- [ ] Dashboard shows
- [ ] CRM pipeline loads
- [ ] Can drag deals
- [ ] Database updates work
- [ ] Logout works

## 🔒 Security Checklist

### Supabase
- [x] RLS enabled on `deals` table
- [x] Policies restrict access properly
- [ ] Service role key NOT in frontend code
- [ ] Anon key is in environment variable
- [ ] Production API keys different from dev

### Next.js
- [x] Middleware protects routes
- [x] Server components for sensitive data
- [x] No secrets in client components
- [x] HTTPS only in production

### Authentication
- [x] Email verification enabled (optional)
- [x] Strong password requirements
- [x] Session expiry configured
- [ ] Rate limiting enabled (Supabase)

## ⚡ Performance Checklist

### Build Optimization
- [x] Next.js image optimization enabled
- [x] Unused code eliminated
- [x] CSS minimized
- [x] JavaScript bundled
- [x] Static pages pre-rendered

### Database
- [x] Indexes on foreign keys
- [x] Indexes on frequently queried columns
- [x] RLS policies optimized
- [ ] Connection pooling configured

### Loading
- [x] Loading states implemented
- [x] Error boundaries in place
- [ ] Skeleton screens (future)
- [ ] Progressive loading (future)

## 📱 Browser Support

Tested in:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari
- [ ] Mobile Chrome

## 🧪 Post-Deployment Testing

### Smoke Tests
1. [ ] Homepage loads
2. [ ] Signup works
3. [ ] Login works
4. [ ] Dashboard loads
5. [ ] CRM loads
6. [ ] Drag-and-drop works
7. [ ] Data persists
8. [ ] Logout works

### Load Testing
- [ ] Multiple users simultaneously
- [ ] Large number of deals (100+)
- [ ] Rapid drag-and-drop operations
- [ ] Network throttling test

### Data Integrity
- [ ] Deal updates save correctly
- [ ] Stage changes persist
- [ ] No data loss on errors
- [ ] Concurrent updates handled

## 🐛 Common Issues

### Issue: White screen after deployment
**Check:**
- Environment variables set correctly
- Build logs for errors
- Browser console for errors
- Network tab for failed requests

### Issue: Authentication not working
**Check:**
- Supabase URL correct
- Anon key correct
- Middleware deployed
- Cookies enabled

### Issue: Database connection fails
**Check:**
- Supabase project active
- RLS policies correct
- User authenticated
- Network connectivity

## 📊 Monitoring

### Vercel Analytics
- [ ] Enable Web Analytics
- [ ] Enable Speed Insights
- [ ] Set up Error Tracking

### Supabase
- [ ] Monitor API usage
- [ ] Check database size
- [ ] Review query performance
- [ ] Set up alerts

### Custom Metrics
- [ ] Track user signups
- [ ] Monitor deal creation rate
- [ ] Measure drag-and-drop usage
- [ ] Log error frequency

## 🔄 Update Process

When making changes:

1. **Develop locally:**
   ```bash
   git checkout -b feature/new-feature
   npm run dev
   # Make changes and test
   ```

2. **Test build:**
   ```bash
   npm run build
   npm start
   ```

3. **Commit and push:**
   ```bash
   git add .
   git commit -m "Add new feature"
   git push origin feature/new-feature
   ```

4. **Create PR and review**

5. **Merge to main**

6. **Vercel auto-deploys**

7. **Test production**

## 📞 Emergency Contacts

### Critical Issues
- Database down: Check Supabase status page
- Vercel down: Check Vercel status page
- Auth failing: Check Supabase auth logs

### Rollback
```bash
# Vercel Dashboard > Deployments
# Find last working deployment
# Click "..." > "Promote to Production"
```

## ✅ Launch Readiness

All systems go when:
- [x] Phase 1 complete and tested
- [x] Phase 2 complete and tested
- [ ] Database migration applied
- [ ] Environment variables set
- [ ] Production build succeeds
- [ ] All tests pass
- [ ] Documentation complete
- [ ] Team trained on usage

## 🎉 Post-Launch

### Day 1
- [ ] Monitor for errors
- [ ] Check user feedback
- [ ] Verify all features work
- [ ] Review analytics

### Week 1
- [ ] Gather user feedback
- [ ] Fix critical bugs
- [ ] Document issues
- [ ] Plan improvements

### Month 1
- [ ] Analyze usage patterns
- [ ] Identify pain points
- [ ] Plan Phase 3 features
- [ ] Optimize performance

---

**Remember:** Always test in a preview deployment before promoting to production!

**Status:** Phase 2 code complete, ready for database setup and deployment testing.
