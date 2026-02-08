#!/bin/bash

# Paoday CRM - Phase 4: Workspace Hierarchy Setup
# This script provides instructions for applying the workspaces migration

echo "🚀 Phase 4: Workspace Hierarchy Setup"
echo "======================================"
echo ""

# Load environment variables
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
else
  echo "❌ Error: .env.local not found"
  exit 1
fi

SUPABASE_PROJECT_ID="ryuaxvsfqmuskdcsrbmg"
MIGRATION_FILE="supabase/migrations/003_create_workspaces.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
  echo "❌ Migration file not found: $MIGRATION_FILE"
  exit 1
fi

echo "✅ Migration file found: $MIGRATION_FILE"
echo ""
echo "📊 This migration will:"
echo "   - ✅ Create workspaces table (company/team/personal/folder types)"
echo "   - ✅ Add parent_workspace_id for nesting"
echo "   - ✅ Link boards to workspaces"
echo "   - ✅ Create default workspace structure:"
echo "       • Main Workspace (company)"
echo "       • └─ Team Boards (folder)"
echo "       •    ├─ CRM Pipeline (linked)"
echo "       •    └─ Research Pipeline (linked)"
echo "       • └─ Individual Boards (folder)"
echo "       •    └─ My Personal Board (personal)"
echo "   - ✅ Row Level Security policies"
echo "   - ✅ Helper function: get_workspace_tree()"
echo ""
echo "📝 To apply this migration:"
echo ""
echo "1. Go to: https://supabase.com/dashboard/project/$SUPABASE_PROJECT_ID/editor"
echo "2. Click 'SQL Editor' in the left sidebar"
echo "3. Click 'New Query'"
echo "4. Copy and paste the content from: $MIGRATION_FILE"
echo "5. Click 'Run' (or press Ctrl/Cmd + Enter)"
echo ""
echo "   OR use this command to view the SQL:"
echo "   cat $MIGRATION_FILE"
echo ""
echo "🎉 After running the migration:"
echo ""
echo "✅ Your sidebar will show:"
echo "   📂 Main Workspace (dropdown)"
echo "   ├─ 👥 Team Boards"
echo "   │  ├─ 💼 CRM Pipeline"
echo "   │  └─ 🔬 Research"
echo "   ├─ 👤 Individual Boards"
echo "   │  └─ 📝 My Personal Board"
echo "   └─ ➕ New Workspace"
echo ""
echo "✨ Features enabled:"
echo "   • Collapsible workspace sections"
echo "   • Nested workspace hierarchy"
echo "   • Drag-and-drop board organization"
echo "   • Custom icons and colors"
echo "   • Team and personal workspaces"
echo ""
echo "🚀 Next steps:"
echo "1. Apply the migration in Supabase SQL Editor"
echo "2. Run: npm run dev"
echo "3. Visit: http://localhost:3000/dashboard"
echo "4. Test the new workspace sidebar!"
echo ""
echo "💡 Tip: Click '+ New Workspace' to create additional workspaces"
