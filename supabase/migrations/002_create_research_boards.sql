-- Phase 3: Research Boards - Flexible Board System
-- Pattern: board -> board_columns -> board_rows -> board_cells
-- Supports multiple column types with flexible data storage

-- =============================================================================
-- BOARDS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS boards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(50),
  
  -- View settings
  default_view VARCHAR(50) DEFAULT 'table' CHECK (default_view IN ('table', 'kanban')),
  default_group_by_column_id UUID,
  
  -- Access control
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_template BOOLEAN DEFAULT false,
  
  -- Ordering
  position INTEGER DEFAULT 0
);

-- =============================================================================
-- BOARD COLUMNS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS board_columns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE NOT NULL,
  
  name VARCHAR(255) NOT NULL,
  column_type VARCHAR(50) NOT NULL CHECK (column_type IN (
    'status',      -- Status with colored labels
    'person',      -- Person with avatar
    'files',       -- File attachments
    'date',        -- Date picker
    'text',        -- Text input
    'number',      -- Number input
    'vote',        -- Vote/rating
    'checkbox',    -- Simple checkbox
    'link',        -- URL link
    'email',       -- Email address
    'phone'        -- Phone number
  )),
  
  -- Column settings (JSON for flexibility)
  settings JSONB DEFAULT '{}'::jsonb,
  -- Example for status: {"labels": [{"id": "1", "label": "Not Started", "color": "#gray"}, ...]}
  -- Example for person: {"allow_multiple": false}
  -- Example for number: {"format": "currency", "currency": "USD"}
  
  width INTEGER DEFAULT 150,
  position INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  is_required BOOLEAN DEFAULT false,
  is_primary BOOLEAN DEFAULT false  -- Primary column shows in Kanban cards
);

-- =============================================================================
-- BOARD ROWS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS board_rows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE NOT NULL,
  
  position INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT false,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- =============================================================================
-- BOARD CELLS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS board_cells (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  row_id UUID REFERENCES board_rows(id) ON DELETE CASCADE NOT NULL,
  column_id UUID REFERENCES board_columns(id) ON DELETE CASCADE NOT NULL,
  
  -- Flexible value storage
  value_text TEXT,
  value_number NUMERIC,
  value_date TIMESTAMP WITH TIME ZONE,
  value_boolean BOOLEAN,
  value_json JSONB DEFAULT '{}'::jsonb,
  -- value_json examples:
  -- Status: {"status_id": "1", "label": "In Progress", "color": "#3B82F6"}
  -- Person: {"user_id": "uuid", "name": "John Doe", "avatar": "url"}
  -- Files: [{"id": "1", "name": "doc.pdf", "url": "...", "size": 1024}]
  -- Vote: {"votes": 5, "max_votes": 10}
  
  -- Ensure one cell per row-column combination
  UNIQUE(row_id, column_id)
);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS boards_user_id_idx ON boards(user_id);
CREATE INDEX IF NOT EXISTS boards_position_idx ON boards(position);

CREATE INDEX IF NOT EXISTS board_columns_board_id_idx ON board_columns(board_id);
CREATE INDEX IF NOT EXISTS board_columns_position_idx ON board_columns(board_id, position);

CREATE INDEX IF NOT EXISTS board_rows_board_id_idx ON board_rows(board_id);
CREATE INDEX IF NOT EXISTS board_rows_position_idx ON board_rows(board_id, position);

CREATE INDEX IF NOT EXISTS board_cells_row_id_idx ON board_cells(row_id);
CREATE INDEX IF NOT EXISTS board_cells_column_id_idx ON board_cells(column_id);
CREATE INDEX IF NOT EXISTS board_cells_lookup_idx ON board_cells(row_id, column_id);

-- =============================================================================
-- TRIGGERS
-- =============================================================================
CREATE TRIGGER update_boards_updated_at BEFORE UPDATE ON boards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_board_columns_updated_at BEFORE UPDATE ON board_columns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_board_rows_updated_at BEFORE UPDATE ON board_rows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_board_cells_updated_at BEFORE UPDATE ON board_cells
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_cells ENABLE ROW LEVEL SECURITY;

-- Boards policies
CREATE POLICY "Users can view all boards" ON boards
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own boards" ON boards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update boards" ON boards
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own boards" ON boards
  FOR DELETE USING (auth.uid() = user_id);

-- Board columns policies
CREATE POLICY "Users can view board columns" ON board_columns
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM boards WHERE boards.id = board_columns.board_id)
  );

CREATE POLICY "Users can insert board columns" ON board_columns
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM boards WHERE boards.id = board_columns.board_id AND auth.role() = 'authenticated')
  );

CREATE POLICY "Users can update board columns" ON board_columns
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM boards WHERE boards.id = board_columns.board_id)
  );

CREATE POLICY "Users can delete board columns" ON board_columns
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM boards WHERE boards.id = board_columns.board_id)
  );

-- Board rows policies
CREATE POLICY "Users can view board rows" ON board_rows
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM boards WHERE boards.id = board_rows.board_id)
  );

CREATE POLICY "Users can insert board rows" ON board_rows
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM boards WHERE boards.id = board_rows.board_id AND auth.role() = 'authenticated')
  );

CREATE POLICY "Users can update board rows" ON board_rows
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM boards WHERE boards.id = board_rows.board_id)
  );

CREATE POLICY "Users can delete board rows" ON board_rows
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM boards WHERE boards.id = board_rows.board_id)
  );

-- Board cells policies
CREATE POLICY "Users can view board cells" ON board_cells
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM board_rows 
      JOIN boards ON boards.id = board_rows.board_id 
      WHERE board_rows.id = board_cells.row_id
    )
  );

CREATE POLICY "Users can insert board cells" ON board_cells
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM board_rows 
      JOIN boards ON boards.id = board_rows.board_id 
      WHERE board_rows.id = board_cells.row_id AND auth.role() = 'authenticated'
    )
  );

CREATE POLICY "Users can update board cells" ON board_cells
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM board_rows 
      JOIN boards ON boards.id = board_rows.board_id 
      WHERE board_rows.id = board_cells.row_id
    )
  );

CREATE POLICY "Users can delete board cells" ON board_cells
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM board_rows 
      JOIN boards ON boards.id = board_rows.board_id 
      WHERE board_rows.id = board_cells.row_id
    )
  );

-- =============================================================================
-- SAMPLE DATA: Research Board Template
-- =============================================================================

-- Create a sample Research Board (will use first authenticated user)
-- Note: In production, this should be created through the UI
DO $$
DECLARE
  v_board_id UUID;
  v_col_company_id UUID;
  v_col_status_id UUID;
  v_col_contact_id UUID;
  v_col_amount_id UUID;
  v_col_date_id UUID;
  v_col_files_id UUID;
  v_col_notes_id UUID;
  v_row1_id UUID;
  v_row2_id UUID;
  v_row3_id UUID;
BEGIN
  -- Create board
  INSERT INTO boards (name, description, icon, color, default_view)
  VALUES (
    'Research Pipeline',
    'Track research opportunities and investment prospects',
    '🔬',
    '#3B82F6',
    'table'
  )
  RETURNING id INTO v_board_id;

  -- Create columns
  INSERT INTO board_columns (board_id, name, column_type, position, is_primary, width, settings)
  VALUES 
    (v_board_id, 'Company', 'text', 0, true, 250, '{}')
    RETURNING id INTO v_col_company_id;

  INSERT INTO board_columns (board_id, name, column_type, position, width, settings)
  VALUES 
    (v_board_id, 'Status', 'status', 1, 150, 
     '{"labels": [
       {"id": "1", "label": "Not Started", "color": "#94A3B8"},
       {"id": "2", "label": "Research", "color": "#3B82F6"},
       {"id": "3", "label": "Outreach", "color": "#F59E0B"},
       {"id": "4", "label": "In Talks", "color": "#10B981"},
       {"id": "5", "label": "Due Diligence", "color": "#8B5CF6"},
       {"id": "6", "label": "Passed", "color": "#6B7280"},
       {"id": "7", "label": "Invested", "color": "#059669"}
     ]}'::jsonb)
    RETURNING id INTO v_col_status_id;

  INSERT INTO board_columns (board_id, name, column_type, position, width, settings)
  VALUES 
    (v_board_id, 'Contact', 'person', 2, 180, '{"allow_multiple": false}')
    RETURNING id INTO v_col_contact_id;

  INSERT INTO board_columns (board_id, name, column_type, position, width, settings)
  VALUES 
    (v_board_id, 'Amount', 'number', 3, 150, '{"format": "currency", "currency": "USD"}')
    RETURNING id INTO v_col_amount_id;

  INSERT INTO board_columns (board_id, name, column_type, position, width, settings)
  VALUES 
    (v_board_id, 'Last Contact', 'date', 4, 150, '{"format": "date"}')
    RETURNING id INTO v_col_date_id;

  INSERT INTO board_columns (board_id, name, column_type, position, width, settings)
  VALUES 
    (v_board_id, 'Files', 'files', 5, 120, '{"max_files": 10}')
    RETURNING id INTO v_col_files_id;

  INSERT INTO board_columns (board_id, name, column_type, position, width, settings)
  VALUES 
    (v_board_id, 'Notes', 'text', 6, 300, '{"multiline": true}')
    RETURNING id INTO v_col_notes_id;

  -- Create sample rows
  INSERT INTO board_rows (board_id, position) VALUES (v_board_id, 0) RETURNING id INTO v_row1_id;
  INSERT INTO board_rows (board_id, position) VALUES (v_board_id, 1) RETURNING id INTO v_row2_id;
  INSERT INTO board_rows (board_id, position) VALUES (v_board_id, 2) RETURNING id INTO v_row3_id;

  -- Create sample cells for Row 1
  INSERT INTO board_cells (row_id, column_id, value_text)
  VALUES (v_row1_id, v_col_company_id, 'BioTech Innovations');

  INSERT INTO board_cells (row_id, column_id, value_json)
  VALUES (v_row1_id, v_col_status_id, '{"status_id": "2", "label": "Research", "color": "#3B82F6"}'::jsonb);

  INSERT INTO board_cells (row_id, column_id, value_json)
  VALUES (v_row1_id, v_col_contact_id, '{"name": "Dr. Sarah Chen", "email": "sarah@biotech.com", "avatar": ""}'::jsonb);

  INSERT INTO board_cells (row_id, column_id, value_number)
  VALUES (v_row1_id, v_col_amount_id, 2500000);

  INSERT INTO board_cells (row_id, column_id, value_date)
  VALUES (v_row1_id, v_col_date_id, NOW() - INTERVAL '3 days');

  INSERT INTO board_cells (row_id, column_id, value_text)
  VALUES (v_row1_id, v_col_notes_id, 'Promising biotech startup focused on gene therapy. Initial meeting went well.');

  -- Create sample cells for Row 2
  INSERT INTO board_cells (row_id, column_id, value_text)
  VALUES (v_row2_id, v_col_company_id, 'AI Research Labs');

  INSERT INTO board_cells (row_id, column_id, value_json)
  VALUES (v_row2_id, v_col_status_id, '{"status_id": "5", "label": "Due Diligence", "color": "#8B5CF6"}'::jsonb);

  INSERT INTO board_cells (row_id, column_id, value_json)
  VALUES (v_row2_id, v_col_contact_id, '{"name": "Mark Johnson", "email": "mark@airesearch.com", "avatar": ""}'::jsonb);

  INSERT INTO board_cells (row_id, column_id, value_number)
  VALUES (v_row2_id, v_col_amount_id, 5000000);

  INSERT INTO board_cells (row_id, column_id, value_date)
  VALUES (v_row2_id, v_col_date_id, NOW() - INTERVAL '1 day');

  INSERT INTO board_cells (row_id, column_id, value_json)
  VALUES (v_row2_id, v_col_files_id, '[{"id": "1", "name": "pitch_deck.pdf", "size": 2048000, "url": "#"}]'::jsonb);

  INSERT INTO board_cells (row_id, column_id, value_text)
  VALUES (v_row2_id, v_col_notes_id, 'Advanced AI research. Currently in due diligence phase. Legal review in progress.');

  -- Create sample cells for Row 3
  INSERT INTO board_cells (row_id, column_id, value_text)
  VALUES (v_row3_id, v_col_company_id, 'CleanEnergy Solutions');

  INSERT INTO board_cells (row_id, column_id, value_json)
  VALUES (v_row3_id, v_col_status_id, '{"status_id": "1", "label": "Not Started", "color": "#94A3B8"}'::jsonb);

  INSERT INTO board_cells (row_id, column_id, value_json)
  VALUES (v_row3_id, v_col_contact_id, '{"name": "Emily Rodriguez", "email": "emily@cleanenergy.com", "avatar": ""}'::jsonb);

  INSERT INTO board_cells (row_id, column_id, value_number)
  VALUES (v_row3_id, v_col_amount_id, 1800000);

  INSERT INTO board_cells (row_id, column_id, value_date)
  VALUES (v_row3_id, v_col_date_id, NOW() - INTERVAL '7 days');

  INSERT INTO board_cells (row_id, column_id, value_text)
  VALUES (v_row3_id, v_col_notes_id, 'Solar energy startup. Scheduled initial call for next week.');

END $$;
