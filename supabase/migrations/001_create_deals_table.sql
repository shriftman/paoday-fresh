-- Create deals table for CRM pipeline
CREATE TABLE IF NOT EXISTS deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Deal information
  company_name VARCHAR(255) NOT NULL,
  stage VARCHAR(50) NOT NULL CHECK (stage IN ('pipeline', 'active', 'passed', 'invested')),
  owner VARCHAR(255),
  last_contact TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  
  -- Deal value (optional for future use)
  amount DECIMAL(12, 2),
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Contact information
  contact_person VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  
  -- User who created/owns the deal
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Ordering within stage
  position INTEGER DEFAULT 0
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS deals_stage_idx ON deals(stage);
CREATE INDEX IF NOT EXISTS deals_user_id_idx ON deals(user_id);
CREATE INDEX IF NOT EXISTS deals_position_idx ON deals(stage, position);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see all deals (for collaboration)
CREATE POLICY "Users can view all deals" ON deals
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Users can insert their own deals
CREATE POLICY "Users can insert deals" ON deals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update all deals (for collaboration)
CREATE POLICY "Users can update deals" ON deals
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy: Users can delete their own deals
CREATE POLICY "Users can delete own deals" ON deals
  FOR DELETE USING (auth.uid() = user_id);

-- Insert sample data for testing
INSERT INTO deals (company_name, stage, owner, last_contact, notes, amount, contact_person, contact_email)
VALUES 
  ('TechStart Inc', 'pipeline', 'John Doe', NOW() - INTERVAL '2 days', 'Initial contact made, interested in Series A', 500000, 'Jane Smith', 'jane@techstart.com'),
  ('GrowthCo', 'active', 'Sarah Johnson', NOW() - INTERVAL '1 day', 'Due diligence in progress', 1000000, 'Mike Brown', 'mike@growthco.com'),
  ('InnovateLab', 'pipeline', 'John Doe', NOW() - INTERVAL '5 days', 'Sent pitch deck, awaiting response', 750000, 'Lisa Chen', 'lisa@innovatelab.com'),
  ('ScaleUp Solutions', 'active', 'Sarah Johnson', NOW() - INTERVAL '3 hours', 'Term sheet signed, legal review', 2000000, 'Tom Wilson', 'tom@scaleup.com'),
  ('NextGen AI', 'passed', 'John Doe', NOW() - INTERVAL '30 days', 'Not a fit for current fund strategy', 300000, 'Emma Davis', 'emma@nextgenai.com'),
  ('FinTech Pro', 'invested', 'Sarah Johnson', NOW() - INTERVAL '10 days', 'Investment completed, board seat secured', 3000000, 'David Lee', 'david@fintechpro.com');
