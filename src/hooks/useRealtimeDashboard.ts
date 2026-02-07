'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Task, ThoughtLog, ActivityLog, AlvaStatus, DashboardStats } from '@/lib/types'
import { getMinutesSince } from '@/utils/formatters'

interface UseDashboardReturn {
  tasks: Task[]
  thoughts: ThoughtLog[]
  activities: ActivityLog[]
  activeTask: Task | null
  alvaStatus: AlvaStatus
  lastActive: string | null
  stats: DashboardStats
  isLoading: boolean
  createTask: (task: Partial<Task>) => Promise<void>
}

export function useRealtimeDashboard(): UseDashboardReturn {
  const [tasks, setTasks] = useState<Task[]>([])
  const [thoughts, setThoughts] = useState<ThoughtLog[]>([])
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true)

    const [tasksResult, thoughtsResult, activitiesResult] = await Promise.all([
      supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('thought_log')
        .select('*')
        .order('created_at', { ascending: true }),
      supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50),
    ])

    if (tasksResult.data) setTasks(tasksResult.data)
    if (thoughtsResult.data) setThoughts(thoughtsResult.data)
    if (activitiesResult.data) setActivities(activitiesResult.data)

    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchInitialData()

    const tasksChannel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tasks' },
        (payload) => {
          setTasks((prev) => [payload.new as Task, ...prev])
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tasks' },
        (payload) => {
          setTasks((prev) =>
            prev.map((task) =>
              task.id === (payload.new as Task).id ? (payload.new as Task) : task
            )
          )
        }
      )
      .subscribe()

    const thoughtsChannel = supabase
      .channel('thoughts-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'thought_log' },
        (payload) => {
          setThoughts((prev) => [...prev, payload.new as ThoughtLog])
        }
      )
      .subscribe()

    const activitiesChannel = supabase
      .channel('activities-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_log' },
        (payload) => {
          setActivities((prev) => [payload.new as ActivityLog, ...prev].slice(0, 50))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(tasksChannel)
      supabase.removeChannel(thoughtsChannel)
      supabase.removeChannel(activitiesChannel)
    }
  }, [supabase, fetchInitialData])

  const activeTask = tasks.find((t) => t.status === 'in_progress') || null

  const lastActivity = activities[0]
  const lastActive = lastActivity?.created_at || null

  const alvaStatus: AlvaStatus = (() => {
    if (activeTask) return 'thinking'
    if (!lastActive) return 'offline'
    const minutesSince = getMinutesSince(lastActive)
    if (minutesSince < 5) return 'online'
    return 'offline'
  })()

  const stats: DashboardStats = {
    completed: tasks.filter((t) => t.status === 'completed').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    estimatedMinutesRemaining: tasks
      .filter((t) => t.status === 'pending' || t.status === 'in_progress')
      .reduce((acc, t) => acc + (t.estimated_minutes || 0), 0),
  }

  const createTask = async (taskData: Partial<Task>) => {
    await supabase.from('tasks').insert({
      title: taskData.title,
      description: taskData.description || null,
      priority: taskData.priority || 3,
      estimated_minutes: taskData.estimated_minutes || null,
      created_by: 'erik',
      assigned_to: 'alva',
      status: 'pending',
    })
  }

  return {
    tasks,
    thoughts,
    activities,
    activeTask,
    alvaStatus,
    lastActive,
    stats,
    isLoading,
    createTask,
  }
}
