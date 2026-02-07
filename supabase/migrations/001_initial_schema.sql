-- Alva Operations Dashboard Schema
-- Run this migration in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
  priority INTEGER NOT NULL DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
  created_by TEXT NOT NULL DEFAULT 'erik' CHECK (created_by IN ('erik', 'alva')),
  assigned_to TEXT DEFAULT 'alva',
  estimated_minutes INTEGER,
  actual_minutes INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  result TEXT,
  error TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Thought log table
CREATE TABLE thought_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  step_number INTEGER DEFAULT 1,
  thought_type TEXT NOT NULL CHECK (thought_type IN ('thinking', 'planning', 'executing', 'tool_call', 'result', 'error', 'decision')),
  content TEXT NOT NULL,
  tool_used TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity log table
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL CHECK (action IN ('search', 'email_sent', 'file_created', 'skill_used', 'error', 'heartbeat')),
  summary TEXT NOT NULL,
  details JSONB,
  source TEXT NOT NULL DEFAULT 'alva' CHECK (source IN ('alva', 'erik', 'system')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX idx_thought_log_task_id ON thought_log(task_id);
CREATE INDEX idx_thought_log_created_at ON thought_log(created_at DESC);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE thought_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Policies for tasks
CREATE POLICY "Authenticated users can read tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can do everything on tasks"
  ON tasks FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to insert tasks (for the dashboard)
CREATE POLICY "Authenticated users can insert tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update tasks
CREATE POLICY "Authenticated users can update tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for thought_log
CREATE POLICY "Authenticated users can read thought_log"
  ON thought_log FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can do everything on thought_log"
  ON thought_log FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policies for activity_log
CREATE POLICY "Authenticated users can read activity_log"
  ON activity_log FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can do everything on activity_log"
  ON activity_log FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- REALTIME
-- ============================================

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE thought_log;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;
