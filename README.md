# Paoday CRM - Phase 1

A modern Customer Relationship Management system built with Next.js 14 and Supabase.

## ✅ Phase 1 Features

- **Next.js 14** with App Router and TypeScript
- **Supabase Authentication** (Email/Password)
- **Login & Signup Pages** with form validation
- **Protected Dashboard** with middleware-based route protection
- **Session Management** with automatic token refresh
- **Tailwind CSS** for beautiful, responsive UI
- **Vercel Deployment Ready**

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd /root/.openclaw/workspace/paoday-fresh
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   
   The `.env.local` file is already configured with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://ryuaxvsfqmuskdcsrbmg.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
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
│   ├── page.tsx              # Homepage
│   ├── login/
│   │   └── page.tsx          # Login page
│   ├── signup/
│   │   └── page.tsx          # Signup page
│   └── dashboard/
│       └── page.tsx          # Protected dashboard
├── components/
│   └── LogoutButton.tsx      # Logout component
├── lib/
│   └── supabase/
│       ├── client.ts         # Browser Supabase client
│       ├── server.ts         # Server Supabase client
│       └── middleware.ts     # Auth middleware logic
├── middleware.ts             # Next.js middleware for route protection
└── .env.local               # Environment variables
```

## 🔐 Authentication Flow

### Sign Up
1. User navigates to `/signup`
2. Enters email and password (min 6 characters)
3. Supabase creates account and sends verification email
4. User is redirected to login page

### Sign In
1. User navigates to `/login`
2. Enters credentials
3. On success, redirected to `/dashboard`
4. Session is maintained with HTTP-only cookies

### Protected Routes
- `/dashboard` requires authentication
- Unauthenticated users are redirected to `/login`
- Authenticated users accessing `/login` or `/signup` are redirected to `/dashboard`

## 🚢 Deployment

### Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Add Environment Variables in Vercel Dashboard:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Deploy to production:**
   ```bash
   vercel --prod
   ```

### Important Notes for Deployment

- **DO NOT use static export (`output: 'export'`)** for this app
- Supabase authentication requires server-side features (middleware, server components)
- Vercel natively supports Next.js server-side features
- Static export would break authentication functionality

### Alternative: Static Export (Not Recommended for Auth)

If you absolutely need static export for a different hosting platform:

1. Uncomment `output: 'export'` in `next.config.mjs`
2. Note that authentication middleware won't work properly
3. You'll need to implement client-side only authentication
4. This is not recommended for production use with authentication

## 🗄️ Supabase Setup

Your Supabase project should have authentication enabled:

1. Go to **Authentication > Settings** in Supabase Dashboard
2. Ensure **Email** provider is enabled
3. Configure email templates if desired
4. (Optional) Disable email confirmation for development:
   - Go to **Authentication > Providers > Email**
   - Toggle "Confirm email" off for testing

## 🧪 Testing the App

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Test signup:**
   - Go to http://localhost:3000
   - Click "Create Account"
   - Enter email and password
   - Check email for verification (if enabled)

3. **Test login:**
   - Go to http://localhost:3000/login
   - Enter your credentials
   - You should be redirected to the dashboard

4. **Test protected routes:**
   - Try accessing /dashboard without logging in
   - You should be redirected to /login

5. **Test logout:**
   - Click "Sign out" in the dashboard
   - You should be redirected to login

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Supabase Auth
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel

## 📝 Next Steps (Phase 2+)

- [ ] Add customer management (CRUD)
- [ ] Create database tables in Supabase
- [ ] Add profile page
- [ ] Implement role-based access control
- [ ] Add real-time features
- [ ] Create API routes for data operations
- [ ] Add analytics dashboard

## 🐛 Troubleshooting

### "Invalid API Key" Error
- Check that `.env.local` exists and has correct values
- Restart the dev server after changing env variables

### Redirected to Login When Already Logged In
- Clear browser cookies
- Check browser console for errors
- Verify Supabase project is accessible

### Email Verification Not Working
- Check Supabase email settings
- Check spam folder
- For development, disable email confirmation in Supabase

## 📄 License

This project is built for Paoday CRM.

## 🙋 Support

For issues or questions:
1. Check the Supabase docs: https://supabase.com/docs
2. Check Next.js docs: https://nextjs.org/docs
3. Review the console for error messages
