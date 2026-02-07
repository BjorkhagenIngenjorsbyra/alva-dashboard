'use client'

import { StatusBar } from '@/components/StatusBar'
import { StatusFooter } from '@/components/StatusFooter'
import { TaskPipeline } from '@/components/TaskPipeline'
import { ThoughtStream } from '@/components/ThoughtStream'
import { ActivityLog } from '@/components/ActivityLog'
import { useRealtimeDashboard } from '@/hooks/useRealtimeDashboard'

export default function Dashboard() {
  const {
    tasks,
    thoughts,
    activities,
    activeTask,
    alvaStatus,
    lastActive,
    stats,
    isLoading,
    createTask,
  } = useRealtimeDashboard()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
          <p className="text-text-secondary">Laddar dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StatusBar status={alvaStatus} lastActive={lastActive} />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <TaskPipeline
          tasks={tasks}
          activeTaskId={activeTask?.id || null}
          onCreateTask={createTask}
        />

        <ThoughtStream
          activeTask={activeTask}
          thoughts={thoughts}
          tasks={tasks}
        />

        <ActivityLog activities={activities} />
      </div>

      <StatusFooter stats={stats} />
    </div>
  )
}
