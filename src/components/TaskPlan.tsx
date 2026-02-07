'use client'

import type { TaskStep } from '@/lib/types'
import clsx from 'clsx'

interface TaskPlanProps {
  steps: TaskStep[]
}

function StepItem({ step, index, isSubstep }: { step: TaskStep; index: number; isSubstep: boolean }) {
  const isCompleted = step.status === 'completed'
  const isInProgress = step.status === 'in_progress'
  const isSkipped = step.status === 'skipped'

  return (
    <div
      className={clsx(
        'flex items-start gap-2 py-1.5',
        isSubstep && 'ml-6',
        isSkipped && 'opacity-50'
      )}
    >
      {isSubstep ? (
        <div
          className={clsx(
            'w-4 h-4 mt-0.5 rounded border flex items-center justify-center shrink-0 transition-colors',
            isCompleted ? 'bg-success border-success' : 'border-border',
            isInProgress && 'border-thought'
          )}
        >
          {isCompleted && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      ) : (
        <div
          className={clsx(
            'w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-medium transition-colors',
            isCompleted ? 'bg-success text-white' : 'bg-border text-text-secondary',
            isInProgress && 'bg-thought text-white'
          )}
        >
          {isCompleted ? (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            index + 1
          )}
        </div>
      )}
      <span
        className={clsx(
          'text-sm leading-tight',
          isCompleted && 'line-through text-text-secondary',
          isInProgress && 'text-thought font-medium',
          !isCompleted && !isInProgress && 'text-text-primary'
        )}
      >
        {step.title}
      </span>
    </div>
  )
}

export function TaskPlan({ steps }: TaskPlanProps) {
  if (steps.length === 0) return null

  const milestones = steps
    .filter((s) => !s.parent_step_id)
    .sort((a, b) => a.sort_order - b.sort_order)

  const substepsByParent = steps
    .filter((s) => s.parent_step_id)
    .reduce((acc, step) => {
      const parentId = step.parent_step_id!
      if (!acc[parentId]) acc[parentId] = []
      acc[parentId].push(step)
      return acc
    }, {} as Record<string, TaskStep[]>)

  Object.keys(substepsByParent).forEach((parentId) => {
    substepsByParent[parentId].sort((a, b) => a.sort_order - b.sort_order)
  })

  const totalSteps = steps.length
  const completedSteps = steps.filter((s) => s.status === 'completed').length
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-success rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-xs text-text-secondary shrink-0">
          {completedSteps}/{totalSteps}
        </span>
      </div>

      <div className="space-y-1">
        {milestones.map((milestone, index) => (
          <div key={milestone.id}>
            <StepItem step={milestone} index={index} isSubstep={false} />
            {substepsByParent[milestone.id]?.map((substep) => (
              <StepItem key={substep.id} step={substep} index={0} isSubstep={true} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
