# Paoday CRM - Phase 1 + 2 + 3 ✨

A modern Customer Relationship Management system with Monday.com-style UI, flexible research boards, and powerful data management. Built with Next.js 14 and Supabase.

## ✅ Phase 1 Features (Complete)

- **Next.js 14** with App Router and TypeScript
- **Supabase Authentication** (Email/Password)
- **Login & Signup Pages** with form validation
- **Protected Dashboard** with middleware-based route protection
- **Session Management** with automatic token refresh
- **Tailwind CSS** for beautiful, responsive UI
- **Vercel Deployment Ready**

## 🆕 Phase 2 Features (Complete)

- **Monday.com-Style UI** with professional design
- **Left Sidebar Navigation** with collapse/expand
- **CRM Pipeline Board** with 4 stages:
  - 🔵 Pipeline - Initial prospects
  - 🟢 Active - Deals in progress
  - ⚫ Passed - Declined opportunities
  - 🟣 Invested - Completed investments
- **Drag-and-Drop** deal cards between stages
- **Real-time Database Updates** with Supabase
- **Deal Management** with:
  - Company name
  - Deal amount
  - Owner/assigned person
  - Last contact date
  - Notes
  - Contact information
- **Dashboard Statistics** with real data
- **Visual Feedback** and smooth animations

## 🔬 Phase 3 Features (Complete)

- **Flexible Research Boards** with configurable schema
- **11 Column Types**:
  - Status (colored labels)
  - Person (with avatars)
  - Files (attachments)
  - Date, Text, Number
  - Vote, Checkbox, Link, Email, Phone
- **Multiple Views**:
  - 📋 Table View (spreadsheet-style)
  - 📊 Kanban View (drag-and-drop cards)
- **Inline Editing** - Click any cell to edit
- **Smart Grouping** - Group by Status, Person, Date, or Text columns
- **Powerful Filtering** - 9 filter operators, multiple filters
- **Real-time Search** - Search across all columns
- **Row Detail Drawer** - Full-screen row details with slide animation
- **Professional UI** - Monday.com-inspired design with colored status pills and avatars

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### Installation

1. **Navigate to the project:**
   ```bash
   cd /root/.openclaw/workspace/paoday-fresh
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup database (Phase 2):**
   
   Apply the deals table migration in Supabase:
   ```bash
   # Option 1: Follow the guide
   cat SETUP-PHASE2.md
   
   # Option 2: Use the script
   ./setup-database.sh
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
paoday-fresh/
├── app/
│   ├── page.tsx                    # Homepage
│   ├── login/page.tsx              # Login page
│   ├── signup/page.tsx             # Signup page
│   └── dashboard/
│       ├── layout.tsx              # Dashboard layout with sidebar
│       ├── page.tsx                # Dashboard home (stats)
│       ├── crm/page.tsx            # CRM Pipeline Board
│       ├── contacts/page.tsx       # Contacts (placeholder)
│       ├── companies/page.tsx      # Companies (placeholder)
│       ├── documents/page.tsx      # Documents (placeholder)
│       └── settings/page.tsx       # Settings (placeholder)
│
├── components/
│   ├── Sidebar.tsx                 # 🆕 Left navigation sidebar
│   ├── CRMBoard.tsx                # 🆕 Main pipeline board
│   ├── PipelineColumn.tsx          # 🆕 Stage column component
│   ├── DealCard.tsx                # 🆕 Deal card component
│   └── LogoutButton.tsx            # Logout component
│
├── lib/
│   └── supabase/
│       ├── client.ts               # Browser Supabase client
│       ├── server.ts               # Server Supabase client
│       └── middleware.ts           # Auth middleware logic
│
├── supabase/
│   └── migrations/
│       └── 001_create_deals_table.sql  # 🆕 Database schema
│
├── middleware.ts                   # Route protection
├── .env.local                      # Environment variables
│
└── Documentation/
    ├── PHASE1-COMPLETION.md        # Phase 1 report
    ├── PHASE2-COMPLETION.md        # 🆕 Phase 2 report
    ├── SETUP-PHASE2.md             # 🆕 Phase 2 setup guide
    ├── VISUAL-GUIDE.md             # 🆕 Visual reference
    └── QUICKSTART.md               # Quick start guide
```

## 🎯 Key Pages

### Dashboard (`/dashboard`)
- Welcome screen with user info
- Statistics cards (total deals, active, pipeline, value)
- Quick action buttons
- Recent deals list

### CRM Pipeline (`/dashboard/crm`)
- 4-column Kanban board
- Drag-and-drop deal cards
- Stage-specific colors and counts
- Total value per stage
- Add deal buttons (placeholder)

### Navigation
- Home - Dashboard overview
- CRM Pipeline - Deal board
- Contacts - Contact management (coming soon)
- Companies - Company management (coming soon)
- Documents - Document storage (coming soon)
- Settings - App settings (coming soon)

## 🗄️ Database Schema

### `deals` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `company_name` | VARCHAR(255) | Company name (required) |
| `stage` | VARCHAR(50) | Deal stage (pipeline/active/passed/invested) |
| `owner` | VARCHAR(255) | Person assigned to the deal |
| `last_contact` | TIMESTAMP | Last contact date |
| `notes` | TEXT | Deal notes |
| `amount` | DECIMAL(12,2) | Deal amount in USD |
| `contact_person` | VARCHAR(255) | Primary contact name |
| `contact_email` | VARCHAR(255) | Contact email |
| `contact_phone` | VARCHAR(50) | Contact phone |
| `user_id` | UUID | User who created the deal |
| `position` | INTEGER | Position within stage |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

**Features:**
- Row Level Security (RLS) enabled
- Automatic `updated_at` trigger
- Indexed for performance
- Sample data included

## 🔐 Authentication Flow

### Sign Up
1. Navigate to `/signup`
2. Enter email and password
3. Account created in Supabase
4. Redirect to login

### Sign In
1. Navigate to `/login`
2. Enter credentials
3. Redirect to `/dashboard`
4. Session maintained with HTTP-only cookies

### Protected Routes
- All `/dashboard/*` routes require authentication
- Automatic redirect to `/login` if not authenticated
- Middleware handles session refresh

## 🎨 UI/UX Features

### Visual Design
- **Monday.com-inspired** interface
- **Color-coded stages** for quick recognition
- **Gradient icons** for visual appeal
- **Smooth animations** throughout
- **Professional typography** and spacing
- **Hover effects** for interactivity

### Interactions
- **Drag-and-drop** deals between stages
- **Collapsible sidebar** for more space
- **Active state highlighting** in navigation
- **Loading states** during data fetch
- **Drop zone highlighting** during drag

### Responsive
- **Desktop:** Full sidebar + 4 columns
- **Tablet:** Collapsible sidebar recommended
- **Mobile:** Future enhancement needed

## 🧪 Testing the App

### Phase 1 Tests
1. ✅ Signup new account
2. ✅ Login with credentials
3. ✅ Access protected dashboard
4. ✅ Logout functionality

### Phase 2 Tests
1. ✅ View dashboard statistics
2. ✅ Navigate via sidebar
3. ✅ Toggle sidebar collapse/expand
4. ✅ View CRM pipeline with 4 stages
5. ✅ See deal cards in each stage
6. ✅ Drag card between stages
7. ✅ Verify database update
8. ✅ Check column counts update
9. ✅ Verify stage totals update

See **SETUP-PHASE2.md** for detailed testing checklist.

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to Git repository:**
   ```bash
   git init
   git add .
   git commit -m "Phase 2 complete"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your Git repository
   - Vercel auto-detects Next.js

3. **Add Environment Variables:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://ryuaxvsfqmuskdcsrbmg.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   ```

4. **Apply Database Migration:**
   - Go to Supabase SQL Editor
   - Run `supabase/migrations/001_create_deals_table.sql`

5. **Deploy:**
   - Vercel deploys automatically
   - Visit your production URL

### Environment Variables

Required in `.env.local` and production:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Supabase Auth
- **Database:** Supabase (PostgreSQL)
- **Drag-and-Drop:** @dnd-kit
- **Icons:** Lucide React
- **Deployment:** Vercel

## 📝 Phase 3 Roadmap

Potential features for next phase:

### Deal Management
- [ ] Add new deal form
- [ ] Edit deal modal
- [ ] Delete deal confirmation
- [ ] Bulk actions
- [ ] Deal history/timeline

### Advanced Features
- [ ] Search and filter deals
- [ ] Sort by various fields
- [ ] Real-time collaboration
- [ ] Comments on deals
- [ ] File attachments
- [ ] Activity feed

### Integrations
- [ ] Email sync
- [ ] Calendar integration
- [ ] Export to CSV/PDF
- [ ] Slack/Teams notifications
- [ ] API webhooks

### Analytics
- [ ] Deal flow metrics
- [ ] Conversion rates
- [ ] Revenue forecasting
- [ ] Team performance dashboard
- [ ] Custom reports

### User Management
- [ ] User profiles
- [ ] Team management
- [ ] Role-based permissions
- [ ] Activity logs

## 🐛 Troubleshooting

### "deals table does not exist"
**Solution:** Apply the database migration in Supabase SQL Editor

### No deals showing in CRM
**Solution:** 
1. Check Supabase Table Editor for data
2. Verify RLS policies are enabled
3. Ensure you're logged in

### Can't drag cards
**Solution:**
1. Check browser console for errors
2. Verify `@dnd-kit` packages installed
3. Clear cache and refresh

### Sidebar not showing
**Solution:**
1. Verify you're on a `/dashboard/*` route
2. Check `dashboard/layout.tsx` exists
3. Look for console errors

See **SETUP-PHASE2.md** for more troubleshooting.

## 📚 Documentation

- **PHASE1-COMPLETION.md** - Phase 1 detailed report
- **PHASE2-COMPLETION.md** - Phase 2 detailed report
- **SETUP-PHASE2.md** - Step-by-step setup guide
- **VISUAL-GUIDE.md** - Visual walkthrough with ASCII diagrams
- **QUICKSTART.md** - Fast-start instructions

## 🔗 Useful Links

- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **@dnd-kit Docs:** https://docs.dndkit.com/
- **Tailwind Docs:** https://tailwindcss.com/docs
- **Lucide Icons:** https://lucide.dev/

## 📄 License

This project is built for Paoday CRM.

## 🎉 What's New in Phase 2

✨ **Monday.com-style CRM interface**  
✨ **Drag-and-drop deal management**  
✨ **Professional sidebar navigation**  
✨ **Real-time database updates**  
✨ **Beautiful visual design**  
✨ **Smooth animations and interactions**

---

**Ready to use your CRM?** Run `npm run dev` and start managing deals! 🚀
