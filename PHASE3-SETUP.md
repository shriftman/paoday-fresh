# 🔬 Phase 3 Setup Guide - Research Boards

This guide will walk you through setting up the Research Boards feature on top of your existing Paoday CRM (Phase 1 + Phase 2).

## Prerequisites

- ✅ Phase 1 (Authentication) completed
- ✅ Phase 2 (CRM Pipeline) completed
- ✅ Supabase project configured
- ✅ Node.js 18+ and npm installed
- ✅ Code pulled from repository

## 📋 Setup Steps

### Step 1: Apply Database Migration

The Research Boards require new database tables. You need to run the migration SQL.

#### Option A: Via Supabase Dashboard (Recommended)

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open the migration file:
   ```bash
   cat supabase/migrations/002_create_research_boards.sql
   ```
5. Copy the entire SQL content
6. Paste into the Supabase SQL Editor
7. Click **Run** (or press `Cmd/Ctrl + Enter`)
8. Wait for success message: "Success. No rows returned"

#### Option B: Via Supabase CLI

If you have the Supabase CLI installed:

```bash
# Navigate to project directory
cd /root/.openclaw/workspace/paoday-fresh

# Apply migration
supabase db push

# Or apply specific migration
supabase migration up
```

### Step 2: Verify Database Setup

After running the migration, verify the tables were created:

1. Go to **Table Editor** in Supabase Dashboard
2. You should see 4 new tables:
   - `boards`
   - `board_columns`
   - `board_rows`
   - `board_cells`

3. Click on `boards` table and verify sample data:
   - Should have 1 board: "Research Pipeline"

4. Click on `board_columns` table:
   - Should have 7 columns (Company, Status, Contact, Amount, Last Contact, Files, Notes)

5. Click on `board_rows` table:
   - Should have 3 sample rows

6. Click on `board_cells` table:
   - Should have multiple cells with data

### Step 3: Verify Code Files

Check that all new files are present:

```bash
# Navigate to project
cd /root/.openclaw/workspace/paoday-fresh

# Check migration
ls -lh supabase/migrations/002_create_research_boards.sql

# Check types
ls -lh lib/types/board.ts

# Check components
ls -lh components/ResearchBoard.tsx
ls -lh components/BoardTableView.tsx
ls -lh components/BoardKanbanView.tsx
ls -lh components/BoardCell.tsx
ls -lh components/BoardFiltersBar.tsx
ls -lh components/RowDetailDrawer.tsx

# Check page
ls -lh app/dashboard/research/page.tsx
```

### Step 4: Build and Start

Build the project to verify everything compiles:

```bash
# Install dependencies (if not already done)
npm install

# Build the project
npm run build

# Start development server
npm run dev
```

Expected output:
```
✓ Compiled successfully
- Ready on http://localhost:3000
```

### Step 5: Test the Feature

1. **Open your browser**: Navigate to http://localhost:3000

2. **Login**: Use your existing account from Phase 1

3. **Navigate to Research Boards**:
   - Click "Research Boards" in the sidebar (🔬 icon)
   - Or go directly to: http://localhost:3000/dashboard/research

4. **Verify you see**:
   - Board header: "🔬 Research Pipeline"
   - View switcher (Table/Kanban buttons)
   - "Add Row" button
   - Search bar
   - Filter and Sort buttons
   - Group by dropdown

5. **Test Table View**:
   - Should see 3 sample rows
   - Columns: Company, Status, Contact, Amount, Last Contact, Files, Notes
   - Click any cell to edit inline
   - Try changing a status (click status cell, pick from dropdown)
   - Try editing company name (click, type, press Enter)

6. **Test Kanban View**:
   - Click the Kanban icon (grid) in view switcher
   - Should see columns for each status
   - Drag a card between columns
   - Verify status updates

7. **Test Grouping**:
   - Select "Group by Status" from dropdown
   - Should see grouped sections
   - Click group header to collapse/expand

8. **Test Search**:
   - Type "BioTech" in search box
   - Should filter to matching rows

9. **Test Row Detail**:
   - Click any row
   - Detail drawer should slide in from right
   - Try editing fields in drawer
   - Click delete icon to test delete confirmation
   - Click X to close drawer

## 🧪 Detailed Testing Checklist

### Table View Tests

- [ ] **Load**: Board loads with sample data
- [ ] **Columns**: All 7 columns visible
- [ ] **Inline Edit - Text**: Click company cell, edit, save
- [ ] **Inline Edit - Status**: Click status, pick from dropdown
- [ ] **Inline Edit - Person**: Click person, enter name + email
- [ ] **Inline Edit - Number**: Click amount, enter number, see currency format
- [ ] **Inline Edit - Date**: Click date, pick from calendar
- [ ] **Inline Edit - Text (multiline)**: Click notes, enter multi-line text
- [ ] **Row Hover**: Hover row, see action buttons appear
- [ ] **Add Row**: Click "Add Row", new empty row appears
- [ ] **Delete Row**: Click trash icon, confirm deletion

### Kanban View Tests

- [ ] **View Switch**: Click Kanban icon, view changes
- [ ] **Columns**: See columns for each status
- [ ] **Cards**: Cards show company name and key fields
- [ ] **Drag**: Drag card to different column
- [ ] **Drop**: Status updates on drop
- [ ] **Empty Column**: Empty columns show "Drop here"
- [ ] **Card Click**: Click card, drawer opens

### Grouping Tests

- [ ] **Group by Status**: Select from dropdown, groups appear
- [ ] **Group Headers**: See colored group headers with counts
- [ ] **Collapse**: Click header, group collapses
- [ ] **Expand**: Click again, group expands
- [ ] **Remove Grouping**: Select "No grouping", groups disappear

### Filter Tests

- [ ] **Open Filters**: Click "Filter" button
- [ ] **Add Filter**: Click "Add filter"
- [ ] **Select Column**: Choose column from dropdown
- [ ] **Select Operator**: Choose operator (equals, contains, etc.)
- [ ] **Enter Value**: Type filter value
- [ ] **Apply**: Rows filter automatically
- [ ] **Multiple Filters**: Add multiple filters
- [ ] **Remove Filter**: Click X to remove filter
- [ ] **Close Filters**: Click "Filter" again to close

### Search Tests

- [ ] **Type Query**: Type in search box
- [ ] **Instant Filter**: Results update as you type
- [ ] **Multiple Columns**: Search matches across all columns
- [ ] **Clear Search**: Clear search, all rows show

### Row Detail Drawer Tests

- [ ] **Open**: Click row, drawer slides in
- [ ] **All Fields**: All columns visible in drawer
- [ ] **Edit Field**: Click any field, edit
- [ ] **Save**: Changes persist
- [ ] **Delete**: Click trash icon, confirmation modal appears
- [ ] **Confirm Delete**: Click delete in modal, row removed
- [ ] **Cancel Delete**: Click cancel in modal, modal closes
- [ ] **Close Drawer**: Click X, drawer closes
- [ ] **Overlay Close**: Click outside drawer, drawer closes

### Mobile/Responsive Tests

- [ ] **Desktop (1920px)**: Table shows all columns
- [ ] **Laptop (1366px)**: Table shows all columns
- [ ] **Tablet (768px)**: Sidebar collapses, table scrolls
- [ ] **Mobile (375px)**: Needs improvement (known issue)

## 🐛 Troubleshooting

### Issue: "Board not found" message

**Cause**: Database migration not applied or sample data not created

**Solution**:
1. Verify migration was run successfully
2. Check Supabase Table Editor for `boards` table
3. If empty, re-run the migration SQL
4. Check browser console for errors

### Issue: "No research boards found" message

**Cause**: Sample data not created

**Solution**:
1. Open Supabase SQL Editor
2. Run the DO block at the end of the migration file (creates sample board)
3. Or manually insert a board:
   ```sql
   INSERT INTO boards (name, description, icon, default_view)
   VALUES ('My Board', 'Test board', '📊', 'table');
   ```

### Issue: Can't edit cells

**Cause**: RLS policies not set up correctly or user not authenticated

**Solution**:
1. Verify you're logged in (check for user menu in header)
2. Check Supabase Authentication → Users (should see your user)
3. Check RLS policies in Table Editor → boards/board_cells (should see policies)
4. Check browser console for permission errors

### Issue: Drag-and-drop not working

**Cause**: JavaScript error or @dnd-kit not installed

**Solution**:
1. Open browser console (F12)
2. Look for errors
3. If "@dnd-kit" missing:
   ```bash
   npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
   npm run dev
   ```

### Issue: Status colors not showing

**Cause**: Status column settings not loaded

**Solution**:
1. Check `board_columns` table in Supabase
2. Find the Status column
3. Verify `settings` field has JSON with `labels` array
4. Example settings:
   ```json
   {
     "labels": [
       {"id": "1", "label": "Not Started", "color": "#94A3B8"},
       {"id": "2", "label": "Research", "color": "#3B82F6"}
     ]
   }
   ```

### Issue: Build errors

**Cause**: TypeScript errors or missing imports

**Solution**:
1. Check error message in terminal
2. Common fixes:
   ```bash
   # Missing type definitions
   npm install --save-dev @types/react @types/node
   
   # Conflicting imports
   # Check import paths match file structure
   
   # Clear cache
   rm -rf .next
   npm run dev
   ```

### Issue: Slow performance with many rows

**Cause**: Large dataset without optimization

**Solution**:
1. Check row count: `SELECT COUNT(*) FROM board_rows WHERE board_id = '<id>';`
2. If >500 rows, consider:
   - Adding pagination
   - Virtual scrolling
   - Limiting initial load
3. Check database indexes:
   ```sql
   -- Should exist from migration
   \d board_cells
   -- Look for indexes on row_id, column_id
   ```

## 📚 Additional Resources

### Documentation
- **Phase 3 Completion Report**: `PHASE3-COMPLETION.md`
- **Type Definitions**: `lib/types/board.ts` (JSDoc comments)
- **Database Schema**: `supabase/migrations/002_create_research_boards.sql` (inline comments)

### Code Examples

#### Creating a New Board
```typescript
const { data, error } = await supabase
  .from('boards')
  .insert({
    name: 'My Custom Board',
    description: 'Board description',
    icon: '📋',
    default_view: 'table'
  });
```

#### Adding a Column
```typescript
const { data, error } = await supabase
  .from('board_columns')
  .insert({
    board_id: boardId,
    name: 'Priority',
    column_type: 'status',
    position: 10,
    settings: {
      labels: [
        { id: '1', label: 'High', color: '#EF4444' },
        { id: '2', label: 'Medium', color: '#F59E0B' },
        { id: '3', label: 'Low', color: '#10B981' }
      ]
    }
  });
```

#### Adding a Row with Cells
```typescript
// 1. Create row
const { data: row } = await supabase
  .from('board_rows')
  .insert({ board_id: boardId, position: 0 })
  .select()
  .single();

// 2. Create cells
const cells = [
  {
    row_id: row.id,
    column_id: companyColumnId,
    value_text: 'Acme Corp'
  },
  {
    row_id: row.id,
    column_id: statusColumnId,
    value_json: {
      status_id: '1',
      label: 'Active',
      color: '#10B981'
    }
  }
];

await supabase.from('board_cells').insert(cells);
```

### Supabase Queries

#### Get All Board Data
```sql
-- Get board with columns, rows, and cells
SELECT
  b.*,
  json_agg(DISTINCT bc.*) AS columns,
  json_agg(DISTINCT br.*) AS rows
FROM boards b
LEFT JOIN board_columns bc ON bc.board_id = b.id
LEFT JOIN board_rows br ON br.board_id = b.id
WHERE b.id = '<board-id>'
GROUP BY b.id;
```

#### Search Across Cells
```sql
-- Find rows containing search term
SELECT DISTINCT br.*
FROM board_rows br
JOIN board_cells c ON c.row_id = br.id
WHERE br.board_id = '<board-id>'
  AND (
    c.value_text ILIKE '%search%'
    OR c.value_number::text LIKE '%search%'
  );
```

## ✅ Verification Checklist

Before considering Phase 3 complete, verify:

- [ ] Database migration applied successfully
- [ ] Sample board visible in Supabase
- [ ] All 4 tables created (boards, board_columns, board_rows, board_cells)
- [ ] RLS policies active
- [ ] Project builds without errors
- [ ] Research Boards link in sidebar
- [ ] Page loads at /dashboard/research
- [ ] Table view works
- [ ] Kanban view works
- [ ] Inline editing works
- [ ] Drag-and-drop works
- [ ] Grouping works
- [ ] Search works
- [ ] Filters work (basic)
- [ ] Row detail drawer works
- [ ] Add row works
- [ ] Delete row works
- [ ] No console errors
- [ ] Reasonable performance (<1s load time)

## 🎉 Success!

If all tests pass, Phase 3 is successfully set up! You now have:

- ✅ Flexible board system with 11 column types
- ✅ Table and Kanban views
- ✅ Inline editing for all cell types
- ✅ Grouping, filtering, and searching
- ✅ Professional Monday.com-style UI
- ✅ Row detail drawer
- ✅ Sample research board with data

## 🔮 Next Steps

### Immediate
1. Customize the sample board (add/edit columns)
2. Add your real research data
3. Train team on new features
4. Gather user feedback

### Phase 4 Planning
Consider these enhancements:
- Real-time collaboration
- File upload support
- Column management UI
- Advanced filtering (AND/OR logic)
- Saved views
- Templates
- Comments and activity feed
- Export functionality

---

**Need Help?**
- Check `PHASE3-COMPLETION.md` for detailed documentation
- Review code comments in components
- Check Supabase logs for database errors
- Open browser console (F12) for JavaScript errors

**Happy researching! 🔬**
