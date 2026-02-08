-- Phase 4: Workspaces - Hierarchical workspace structure matching Monday.com
-- Pattern: workspaces (with parent_workspace_id for nesting) -> boards

-- =============================================================================
-- WORKSPACES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(50),
  
  -- Workspace type
  type VARCHAR(50) NOT NULL CHECK (type IN ('company', 'team', 'personal', 'folder')),
  
  -- Hierarchical structure
  parent_workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Access control
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Display settings
  is_expanded BOOLEAN DEFAULT true,
  position INTEGER DEFAULT 0
);

-- Add workspace_id to boards table
ALTER TABLE boards 
ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS workspaces_user_id_idx ON workspaces(user_id);
CREATE INDEX IF NOT EXISTS workspaces_parent_id_idx ON workspaces(parent_workspace_id);
CREATE INDEX IF NOT EXISTS workspaces_type_idx ON workspaces(type);
CREATE INDEX IF NOT EXISTS workspaces_position_idx ON workspaces(position);
CREATE INDEX IF NOT EXISTS boards_workspace_id_idx ON boards(workspace_id);

-- =============================================================================
-- TRIGGERS
-- =============================================================================
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- Workspaces policies
CREATE POLICY "Users can view all workspaces" ON workspaces
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own workspaces" ON workspaces
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update workspaces" ON workspaces
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own workspaces" ON workspaces
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- INITIAL DATA SETUP
-- =============================================================================

-- Create default workspace structure for existing users
DO $$
DECLARE
  v_user_id UUID;
  v_main_workspace_id UUID;
  v_team_workspace_id UUID;
  v_personal_workspace_id UUID;
  v_crm_board_id UUID;
  v_research_board_id UUID;
BEGIN
  -- Get the first user (or you can run this for each user)
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  
  IF v_user_id IS NOT NULL THEN
    -- Create Main Workspace (company type)
    INSERT INTO workspaces (name, description, icon, color, type, user_id, position)
    VALUES (
      'Main Workspace',
      'Company-wide workspace',
      '🏢',
      '#3B82F6',
      'company',
      v_user_id,
      0
    )
    RETURNING id INTO v_main_workspace_id;

    -- Create Team Boards section (folder type under Main)
    INSERT INTO workspaces (name, description, icon, color, type, parent_workspace_id, user_id, position)
    VALUES (
      'Team Boards',
      'Collaborative team boards',
      '👥',
      '#10B981',
      'folder',
      v_main_workspace_id,
      v_user_id,
      0
    )
    RETURNING id INTO v_team_workspace_id;

    -- Create Individual Boards section (folder type under Main)
    INSERT INTO workspaces (name, description, icon, color, type, parent_workspace_id, user_id, position)
    VALUES (
      'Individual Boards',
      'Personal workspace boards',
      '👤',
      '#8B5CF6',
      'folder',
      v_main_workspace_id,
      v_user_id,
      1
    )
    RETURNING id INTO v_personal_workspace_id;

    -- Link existing CRM board to Team Boards
    UPDATE boards 
    SET workspace_id = v_team_workspace_id,
        icon = '💼',
        color = '#3B82F6'
    WHERE name = 'CRM Pipeline' OR name LIKE '%Deal%'
    RETURNING id INTO v_crm_board_id;

    -- If no CRM board exists, create one
    IF v_crm_board_id IS NULL THEN
      INSERT INTO boards (name, description, icon, color, workspace_id, user_id, position)
      VALUES (
        'CRM Pipeline',
        'Sales pipeline and deal tracking',
        '💼',
        '#3B82F6',
        v_team_workspace_id,
        v_user_id,
        0
      );
    END IF;

    -- Link existing Research board to Team Boards
    UPDATE boards 
    SET workspace_id = v_team_workspace_id,
        icon = '🔬',
        color = '#F59E0B'
    WHERE name = 'Research Pipeline' OR name LIKE '%Research%'
    RETURNING id INTO v_research_board_id;

    -- If Research board doesn't exist yet, it will be created through the UI
    
    -- Create a personal workspace for the user
    INSERT INTO workspaces (name, description, icon, color, type, parent_workspace_id, user_id, position)
    VALUES (
      'My Personal Board',
      'Personal tasks and notes',
      '📝',
      '#EC4899',
      'personal',
      v_personal_workspace_id,
      v_user_id,
      0
    );

  END IF;
END $$;

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to get workspace hierarchy
CREATE OR REPLACE FUNCTION get_workspace_tree(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  type VARCHAR,
  icon VARCHAR,
  color VARCHAR,
  parent_workspace_id UUID,
  is_expanded BOOLEAN,
  position INTEGER,
  depth INTEGER,
  board_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE workspace_tree AS (
    -- Root workspaces (no parent)
    SELECT 
      w.id,
      w.name,
      w.type,
      w.icon,
      w.color,
      w.parent_workspace_id,
      w.is_expanded,
      w.position,
      0 as depth
    FROM workspaces w
    WHERE w.user_id = p_user_id 
      AND w.parent_workspace_id IS NULL
    
    UNION ALL
    
    -- Child workspaces
    SELECT 
      w.id,
      w.name,
      w.type,
      w.icon,
      w.color,
      w.parent_workspace_id,
      w.is_expanded,
      w.position,
      wt.depth + 1
    FROM workspaces w
    INNER JOIN workspace_tree wt ON w.parent_workspace_id = wt.id
    WHERE w.user_id = p_user_id
  )
  SELECT 
    wt.id,
    wt.name,
    wt.type,
    wt.icon,
    wt.color,
    wt.parent_workspace_id,
    wt.is_expanded,
    wt.position,
    wt.depth,
    COUNT(b.id) as board_count
  FROM workspace_tree wt
  LEFT JOIN boards b ON b.workspace_id = wt.id
  GROUP BY wt.id, wt.name, wt.type, wt.icon, wt.color, 
           wt.parent_workspace_id, wt.is_expanded, wt.position, wt.depth
  ORDER BY wt.depth, wt.position;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
