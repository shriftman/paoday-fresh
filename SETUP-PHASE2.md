# 🚀 Phase 2 Setup Guide - Paoday CRM

Quick guide to get Phase 2 (CRM Pipeline) up and running.

## ✅ Prerequisites

Before starting, ensure Phase 1 is complete:
- [x] Next.js app installed
- [x] Supabase connected
- [x] Authentication working
- [x] Can login at `/login`

## 📦 Step 1: Install New Dependencies

Already installed! But if you need to reinstall:

```bash
cd /root/.openclaw/workspace/paoday-fresh
npm install
```

New packages added:
- `@dnd-kit/core` - Drag and drop core
- `@dnd-kit/sortable` - Sortable lists
- `@dnd-kit/utilities` - Helper utilities
- `lucide-react` - Icon library

## 🗄️ Step 2: Create Database Table

### Option A: Supabase Dashboard (Easiest)

1. **Open Supabase SQL Editor:**
   ```
   https://supabase.com/dashboard/project/ryuaxvsfqmuskdcsrbmg/editor
   ```

2. **Click "SQL Editor"** in the left sidebar

3. **Click "New Query"** button

4. **Copy the migration file:**
   ```bash
   cat supabase/migrations/001_create_deals_table.sql
   ```

5. **Paste into SQL editor**

6. **Click "Run"** (or press `Ctrl+Enter` / `Cmd+Enter`)

7. **Verify success:**
   - Go to **Table Editor**
   - You should see `deals` table
   - Should have 6 sample deals

### Option B: Using the Script

```bash
./setup-database.sh
```

Follow the instructions it provides.

## 🎯 Step 3: Start the Application

```bash
# Start development server
npm run dev
```

The app will start at: **http://localhost:3000**

## 🧪 Step 4: Test the Features

### Test 1: Login
1. Go to: http://localhost:3000/login
2. Login with your credentials
3. Should redirect to dashboard

### Test 2: View Dashboard
1. Should see: http://localhost:3000/dashboard
2. Check that you see:
   - ✅ Sidebar on the left
   - ✅ Statistics cards (Total, Active, Pipeline, Value)
   - ✅ Quick Actions buttons
   - ✅ Recent Deals list

### Test 3: Navigate to CRM
1. Click **"CRM Pipeline"** in sidebar
2. Should go to: http://localhost:3000/dashboard/crm
3. Check that you see:
   - ✅ 4 columns: Pipeline, Active, Passed, Invested
   - ✅ Deal cards in each column
   - ✅ Deal counts per column
   - ✅ Total values per column

### Test 4: Drag and Drop
1. **Hover** over a deal card
2. **Click and hold** the card
3. **Drag** to a different column
4. **Release** the mouse button
5. **Verify:**
   - ✅ Card moves to new column
   - ✅ Column counts update
   - ✅ Column totals update
   - ✅ No errors in console

### Test 5: Sidebar Toggle
1. Click the **toggle button** (◀ or ▶) on sidebar
2. Sidebar should collapse to icons only
3. Click again to expand
4. Verify smooth animation

### Test 6: Navigation
1. Click each sidebar item:
   - Home → Dashboard
   - CRM Pipeline → Pipeline view
   - Contacts → Placeholder page
   - Companies → Placeholder page
   - Documents → Placeholder page
   - Settings → Placeholder page
2. Active item should be highlighted in blue

### Test 7: Logout
1. Click **"Logout"** in sidebar
2. Should redirect to login page
3. Try accessing `/dashboard` directly
4. Should redirect back to login

## 🔍 Verify Database Changes

After dragging a deal, verify in Supabase:

1. Go to **Table Editor**
2. Click on **deals** table
3. Find the deal you moved
4. Check the **stage** column updated
5. Check the **updated_at** column changed

## 🎨 Visual Checklist

### Sidebar
- [ ] Dark gray background (`#1F2937`)
- [ ] Logo "P" in gradient circle
- [ ] "Paoday CRM" text
- [ ] Menu items with icons
- [ ] Active item highlighted in blue
- [ ] Logout button at bottom
- [ ] Toggle button on right edge
- [ ] Smooth collapse/expand animation

### Dashboard
- [ ] "Welcome back!" heading
- [ ] User email displayed
- [ ] 4 statistics cards with icons
- [ ] Cards show real data from database
- [ ] Quick Actions section with 3 buttons
- [ ] Recent Deals list with company icons
- [ ] Stage badges with colors

### CRM Pipeline
- [ ] Page title "CRM Pipeline"
- [ ] Subtitle with instructions
- [ ] 4 columns with colored headers
- [ ] Pipeline (Blue), Active (Green), Passed (Gray), Invested (Purple)
- [ ] Deal count per column
- [ ] Total value per column (formatted)
- [ ] Cards in each column
- [ ] Cards show company, amount, owner, date

### Deal Cards
- [ ] White background with border
- [ ] Company icon (gradient circle)
- [ ] Company name
- [ ] Deal amount in green with $
- [ ] Owner name with user icon
- [ ] Last contact with calendar icon
- [ ] Notes preview (if available)
- [ ] Contact person (if available)
- [ ] Hover effect (shadow increases)
- [ ] More button (⋮) appears on hover

## 🐛 Troubleshooting

### Issue: "deals table does not exist"
**Solution:** Apply the database migration (Step 2)

### Issue: No deals showing in CRM
**Solution:** 
1. Check Supabase Table Editor
2. Verify `deals` table has data
3. Check RLS policies are enabled
4. Make sure you're logged in

### Issue: Can't drag cards
**Solution:**
1. Check browser console for errors
2. Verify `@dnd-kit` packages installed
3. Try refreshing the page
4. Clear browser cache

### Issue: Sidebar not showing
**Solution:**
1. Check that `dashboard/layout.tsx` exists
2. Verify you're on a `/dashboard/*` route
3. Check browser console for errors

### Issue: Build errors
**Solution:**
1. Delete `.next` folder: `rm -rf .next`
2. Delete `node_modules`: `rm -rf node_modules`
3. Reinstall: `npm install`
4. Build again: `npm run build`

### Issue: ESLint conflict warning
**Solution:** This is a known minor issue from Phase 1. It doesn't affect functionality. To fix:
```bash
# Option 1: Ignore it (safe)
# Option 2: Remove parent ESLint config
rm ../.eslintrc.json
```

## 📊 Sample Data Included

The migration includes 6 test deals:

1. **TechStart Inc** - Pipeline - $500K
2. **GrowthCo** - Active - $1M
3. **InnovateLab** - Pipeline - $750K
4. **ScaleUp Solutions** - Active - $2M
5. **NextGen AI** - Passed - $300K
6. **FinTech Pro** - Invested - $3M

You can drag these between stages to test!

## 🎯 Success Criteria

Phase 2 is working correctly if:

- ✅ All pages load without errors
- ✅ Sidebar navigation works
- ✅ Dashboard shows real statistics
- ✅ CRM pipeline displays 4 columns
- ✅ Sample deals are visible
- ✅ Drag and drop works smoothly
- ✅ Database updates on drop
- ✅ Column counts update dynamically
- ✅ Logout works correctly

## 🚀 Next Steps

Once Phase 2 is working:

1. **Familiarize yourself** with the interface
2. **Test drag-and-drop** thoroughly
3. **Plan Phase 3** features:
   - Add new deal form
   - Edit deal modal
   - Delete functionality
   - Search and filter
   - Real-time updates

## 📞 Need Help?

Check these resources:
- **PHASE2-COMPLETION.md** - Detailed feature list
- **VISUAL-GUIDE.md** - Visual walkthrough
- **README.md** - General documentation
- **Supabase Docs** - https://supabase.com/docs
- **@dnd-kit Docs** - https://docs.dndkit.com/

## ⚡ Quick Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Check for TypeScript errors
npx tsc --noEmit

# Run ESLint
npm run lint
```

---

**Ready?** Run `npm run dev` and visit http://localhost:3000! 🎉
