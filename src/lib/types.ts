export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'

export type ThoughtType = 'thinking' | 'planning' | 'executing' | 'tool_call' | 'result' | 'error' | 'decision'

export type ActivityAction = string

export type Creator = 'erik' | 'alva'

export type Source = 'alva' | 'erik' | 'system'

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: number
  created_by: Creator
  assigned_to: string | null
  estimated_minutes: number | null
  actual_minutes: number | null
  started_at: string | null
  completed_at: string | null
  result: string | null
  error: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ThoughtLog {
  id: string
  task_id: string | null
  step_number: number
  thought_type: ThoughtType
  content: string
  tool_used: string | null
  duration_ms: number | null
  created_at: string
}

export interface ActivityLog {
  id: string
  action: ActivityAction
  summary: string
  details: Record<string, unknown> | null
  source: Source
  created_at: string
}

export interface DashboardStats {
  completed: number
  inProgress: number
  pending: number
  estimatedMinutesRemaining: number
}

export type AlvaStatus = 'online' | 'thinking' | 'offline'
