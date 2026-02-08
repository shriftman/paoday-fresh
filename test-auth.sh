#!/bin/bash

# Paoday CRM Phase 1 - Quick Test Script

echo "🚀 Paoday CRM Phase 1 - Authentication Test"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the paoday-fresh directory"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found"
    echo "Make sure Supabase credentials are configured"
    exit 1
fi

echo "✅ Environment configured"
echo "✅ Dependencies installed"
echo ""

# Build the app
echo "🔨 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "🎯 Next Steps:"
    echo "1. Run: npm run dev"
    echo "2. Open: http://localhost:3000"
    echo "3. Test:"
    echo "   - Click 'Create Account'"
    echo "   - Sign up with email/password"
    echo "   - Login with credentials"
    echo "   - Access dashboard"
    echo "   - Test logout"
    echo ""
    echo "📚 Documentation:"
    echo "   - README.md - Full documentation"
    echo "   - QUICKSTART.md - Quick start guide"
    echo "   - PHASE1-COMPLETION.md - Completion report"
    echo ""
    echo "🚀 Deploy to Vercel: vercel --prod"
else
    echo "❌ Build failed - check errors above"
    exit 1
fi
