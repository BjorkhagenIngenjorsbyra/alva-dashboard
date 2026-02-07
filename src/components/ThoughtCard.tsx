'use client'

import type { ThoughtLog, ThoughtType } from '@/lib/types'
import { formatTime, formatDurationMs } from '@/utils/formatters'
import clsx from 'clsx'

interface ThoughtCardProps {
  thought: ThoughtLog
  isNew?: boolean
}

const thoughtConfig: Record<ThoughtType, { icon: string; label: string; color: string }> = {
  thinking: { icon: '🧠', label: 'Tänker', color: 'border-thought/30 bg-thought/5' },
  planning: { icon: '📋', label: 'Planerar', color: 'border-accent/30 bg-accent/5' },
  executing: { icon: '⚡', label: 'Utför', color: 'border-warning/30 bg-warning/5' },
  tool_call: { icon: '🔧', label: 'Verktyg', color: 'border-text-secondary/30 bg-text-secondary/5' },
  result: { icon: '✅', label: 'Resultat', color: 'border-success/30 bg-success/5' },
  error: { icon: '❌', label: 'Fel', color: 'border-error/30 bg-error/5' },
  decision: { icon: '🤔', label: 'Beslut', color: 'border-thought/30 bg-thought/5' },
}

export function ThoughtCard({ thought, isNew }: ThoughtCardProps) {
  const config = thoughtConfig[thought.thought_type]

  return (
    <div
      className={clsx(
        'rounded-lg border p-3 transition-all duration-300',
        config.color,
        isNew && 'animate-fade-in-up'
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg shrink-0" role="img" aria-label={config.label}>
          {config.icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
              {config.label}
            </span>
            {thought.tool_used && (
              <span className="px-1.5 py-0.5 bg-background/50 rounded text-xs font-mono text-text-secondary">
                {thought.tool_used}
              </span>
            )}
            {thought.duration_ms && (
              <span className="text-xs text-text-secondary/60">
                {formatDurationMs(thought.duration_ms)}
              </span>
            )}
          </div>
          <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap break-words">
            {thought.content}
          </p>
        </div>
        <span className="text-xs text-text-secondary/60 shrink-0 font-mono">
          {formatTime(thought.created_at)}
        </span>
      </div>
    </div>
  )
}
