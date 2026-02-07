'use client'

import { useState } from 'react'
import type { Task, TaskStatus, TaskStep } from '@/lib/types'
import { formatDuration, formatRelativeTime } from '@/utils/formatters'
import { NewTaskModal } from './NewTaskModal'
import { TaskPlan } from './TaskPlan'
import clsx from 'clsx'

interface TaskPipelineProps {
  tasks: Task[]
  taskSteps: TaskStep[]
  activeTaskId: string | null
  onCreateTask: (task: Partial<Task>) => Promise<void>
  onDeleteTask: (taskId: string) => Promise<void>
}

const statusConfig: Record<TaskStatus, { label: string; bg: string; text: string }> = {
  pending: { label: 'Väntande', bg: 'bg-accent/20', text: 'text-accent' },
  in_progress: { label: 'Pågår', bg: 'bg-thought/20', text: 'text-thought' },
  completed: { label: 'Klar', bg: 'bg-success/20', text: 'text-success' },
  failed: { label: 'Misslyckad', bg: 'bg-error/20', text: 'text-error' },
  cancelled: { label: 'Avbruten', bg: 'bg-text-secondary/20', text: 'text-text-secondary' },
}

const priorityColors: Record<number, string> = {
  1: 'border-l-error',
  2: 'border-l-warning',
  3: 'border-l-accent',
  4: 'border-l-text-secondary',
  5: 'border-l-border',
}

function TaskCard({
  task,
  steps,
  isActive,
  onDelete,
}: {
  task: Task
  steps: TaskStep[]
  isActive: boolean
  onDelete: (taskId: string) => Promise<void>
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [deleteState, setDeleteState] = useState<'idle' | 'confirm'>('idle')
  const status = statusConfig[task.status]

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (deleteState === 'idle') {
      setDeleteState('confirm')
      setTimeout(() => setDeleteState('idle'), 3000)
    } else {
      await onDelete(task.id)
    }
  }

  return (
    <div
      className={clsx(
        'bg-background border border-border rounded-lg overflow-hidden cursor-pointer transition-all duration-200 border-l-2',
        priorityColors[task.priority],
        isActive && 'animate-pulse-border border-accent',
        !isActive && 'hover:border-text-secondary/50'
      )}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-medium text-text-primary text-sm leading-tight line-clamp-2 flex-1">
            {task.title}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', status.bg, status.text)}>
              {status.label}
            </span>
            <button
              onClick={handleDeleteClick}
              className={clsx(
                'p-1 rounded transition-colors text-xs',
                deleteState === 'confirm'
                  ? 'bg-error/20 text-error'
                  : 'hover:bg-error/10 text-text-secondary hover:text-error'
              )}
              title={deleteState === 'confirm' ? 'Klicka igen för att radera' : 'Ta bort'}
            >
              {deleteState === 'confirm' ? (
                <span className="text-xs px-1">Ta bort?</span>
              ) : (
                <span>🗑️</span>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-text-secondary">
          {task.estimated_minutes && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDuration(task.estimated_minutes)}
            </span>
          )}
          <span>{formatRelativeTime(task.created_at)}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 border-t border-border pt-2 space-y-3 animate-fade-in-up">
          {task.description && (
            <p className="text-sm text-text-secondary">{task.description}</p>
          )}

          {steps.length > 0 && <TaskPlan steps={steps} />}

          {task.result && (
            <div className="p-2 bg-success/10 border border-success/20 rounded text-sm text-success">
              <span className="font-medium">Resultat:</span> {task.result}
            </div>
          )}
          {task.error && (
            <div className="p-2 bg-error/10 border border-error/20 rounded text-sm text-error">
              <span className="font-medium">Fel:</span> {task.error}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function TaskPipeline({ tasks, taskSteps, activeTaskId, onCreateTask, onDeleteTask }: TaskPipelineProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const getStepsForTask = (taskId: string) => taskSteps.filter((s) => s.task_id === taskId)

  const inProgress = tasks.filter((t) => t.status === 'in_progress')
  const pending = tasks
    .filter((t) => t.status === 'pending')
    .sort((a, b) => a.priority - b.priority)
  const completed = tasks
    .filter((t) => t.status === 'completed')
    .sort((a, b) => new Date(b.completed_at || b.updated_at).getTime() - new Date(a.completed_at || a.updated_at).getTime())
    .slice(0, 5)

  const hasAnyTasks = inProgress.length > 0 || pending.length > 0 || completed.length > 0

  return (
    <aside className="w-full lg:w-[280px] bg-panel border-b lg:border-b-0 lg:border-r border-border flex flex-col shrink-0">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-text-primary flex items-center gap-2">
          <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Uppgifter
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="p-1.5 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg transition-colors"
          title="Ny uppgift"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
        {!hasAnyTasks && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-border/50 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-text-secondary text-sm">Inga uppgifter ännu</p>
            <p className="text-text-secondary/60 text-xs mt-1">Klicka på + för att skapa en</p>
          </div>
        )}

        {inProgress.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-thought uppercase tracking-wider px-1">
              Pågår
            </h3>
            {inProgress.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                steps={getStepsForTask(task.id)}
                isActive={task.id === activeTaskId}
                onDelete={onDeleteTask}
              />
            ))}
          </div>
        )}

        {pending.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-accent uppercase tracking-wider px-1">
              I kö ({pending.length})
            </h3>
            {pending.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                steps={getStepsForTask(task.id)}
                isActive={false}
                onDelete={onDeleteTask}
              />
            ))}
          </div>
        )}

        {completed.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-success uppercase tracking-wider px-1">
              Nyligen klara
            </h3>
            {completed.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                steps={getStepsForTask(task.id)}
                isActive={false}
                onDelete={onDeleteTask}
              />
            ))}
          </div>
        )}
      </div>

      <NewTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={onCreateTask}
      />
    </aside>
  )
}
