'use client'

import type { DashboardStats } from '@/lib/types'
import { formatDuration } from '@/utils/formatters'

interface StatusFooterProps {
  stats: DashboardStats
}

export function StatusFooter({ stats }: StatusFooterProps) {
  return (
    <footer className="h-10 bg-panel border-t border-border px-4 flex items-center justify-center shrink-0">
      <div className="flex items-center gap-4 text-sm">
        <span className="text-text-secondary">Idag:</span>
        <span className="text-success font-medium">{stats.completed} klara</span>
        <span className="text-text-secondary">·</span>
        <span className="text-thought font-medium">{stats.inProgress} pågår</span>
        <span className="text-text-secondary">·</span>
        <span className="text-accent font-medium">{stats.pending} i kö</span>
        {stats.estimatedMinutesRemaining > 0 && (
          <>
            <span className="text-text-secondary">·</span>
            <span className="text-text-secondary">
              ~{formatDuration(stats.estimatedMinutesRemaining)} kvar
            </span>
          </>
        )}
      </div>
    </footer>
  )
}
