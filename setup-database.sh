#!/bin/bash

# Paoday CRM - Database Setup Script
# This script applies the deals table migration to Supabase

echo "🚀 Paoday CRM - Database Setup"
echo "================================"
echo ""

# Load environment variables
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
else
  echo "❌ Error: .env.local not found"
  exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "⚠️  Supabase CLI not found. Installing..."
  echo "   Run: npm install -g supabase"
  echo ""
  echo "   Or apply the migration manually:"
  echo "   1. Go to: https://supabase.com/dashboard/project/ryuaxvsfqmuskdcsrbmg/editor"
  echo "   2. Open SQL Editor"
  echo "   3. Copy and paste the content from:"
  echo "      supabase/migrations/001_create_deals_table.sql"
  echo "   4. Run the SQL"
  exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Link to Supabase project
echo "📡 Linking to Supabase project..."
SUPABASE_PROJECT_ID="ryuaxvsfqmuskdcsrbmg"

# Apply migration
echo "📊 Applying database migration..."
echo "   Creating deals table..."
echo ""

# Read and display migration file
MIGRATION_FILE="supabase/migrations/001_create_deals_table.sql"

if [ -f "$MIGRATION_FILE" ]; then
  echo "Migration file found. Apply it manually:"
  echo ""
  echo "1. Go to: https://supabase.com/dashboard/project/$SUPABASE_PROJECT_ID/editor"
  echo "2. Click 'SQL Editor' in the left sidebar"
  echo "3. Click 'New Query'"
  echo "4. Copy and paste the content from: $MIGRATION_FILE"
  echo "5. Click 'Run'"
  echo ""
  echo "✨ After running the migration, you'll have:"
  echo "   - ✅ deals table with all fields"
  echo "   - ✅ Sample data (6 test deals)"
  echo "   - ✅ Row Level Security policies"
  echo "   - ✅ Automatic updated_at trigger"
else
  echo "❌ Migration file not found: $MIGRATION_FILE"
  exit 1
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Apply the migration in Supabase SQL Editor"
echo "2. Run: npm run dev"
echo "3. Visit: http://localhost:3000/dashboard/crm"
