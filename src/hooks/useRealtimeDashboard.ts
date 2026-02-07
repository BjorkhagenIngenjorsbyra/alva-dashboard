'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Task, ThoughtLog, ActivityLog, TaskStep, AlvaStatus, DashboardStats } from '@/lib/types'
import { getMinutesSince } from '@/utils/formatters'

interface UseDashboardReturn {
  tasks: Task[]
  thoughts: ThoughtLog[]
  activities: ActivityLog[]
  taskSteps: TaskStep[]
  activeTask: Task | null
  alvaStatus: AlvaStatus
  lastActive: string | null
  stats: DashboardStats
  isLoading: boolean
  createTask: (task: Partial<Task>) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
}

export function useRealtimeDashboard(): UseDashboardReturn {
  const [tasks, setTasks] = useState<Task[]>([])
  const [thoughts, setThoughts] = useState<ThoughtLog[]>([])
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [taskSteps, setTaskSteps] = useState<TaskStep[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true)

    const [tasksResult, thoughtsResult, activitiesResult, stepsResult] = await Promise.all([
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
      supabase
        .from('task_steps')
        .select('*')
        .order('sort_order', { ascending: true }),
    ])

    if (tasksResult.data) setTasks(tasksResult.data)
    if (thoughtsResult.data) setThoughts(thoughtsResult.data)
    if (activitiesResult.data) setActivities(activitiesResult.data)
    if (stepsResult.data) setTaskSteps(stepsResult.data)

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
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'tasks' },
        (payload) => {
          setTasks((prev) => prev.filter((task) => task.id !== (payload.old as Task).id))
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

    const stepsChannel = supabase
      .channel('steps-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'task_steps' },
        (payload) => {
          setTaskSteps((prev) => [...prev, payload.new as TaskStep])
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'task_steps' },
        (payload) => {
          setTaskSteps((prev) =>
            prev.map((step) =>
              step.id === (payload.new as TaskStep).id ? (payload.new as TaskStep) : step
            )
          )
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'task_steps' },
        (payload) => {
          setTaskSteps((prev) => prev.filter((step) => step.id !== (payload.old as TaskStep).id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(tasksChannel)
      supabase.removeChannel(thoughtsChannel)
      supabase.removeChannel(activitiesChannel)
      supabase.removeChannel(stepsChannel)
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

  const deleteTask = async (taskId: string) => {
    await supabase.from('tasks').delete().eq('id', taskId)
  }

  return {
    tasks,
    thoughts,
    activities,
    taskSteps,
    activeTask,
    alvaStatus,
    lastActive,
    stats,
    isLoading,
    createTask,
    deleteTask,
  }
}
