'use client'

import type { ActivityLog as ActivityLogType, ActivityAction } from '@/lib/types'
import { formatTime } from '@/utils/formatters'
import clsx from 'clsx'

interface ActivityLogProps {
  activities: ActivityLogType[]
}

const actionConfig: Record<ActivityAction, { icon: string; color: string }> = {
  search: { icon: '🔍', color: 'text-accent' },
  email_sent: { icon: '📧', color: 'text-success' },
  file_created: { icon: '📄', color: 'text-warning' },
  skill_used: { icon: '🔧', color: 'text-thought' },
  error: { icon: '❌', color: 'text-error' },
  heartbeat: { icon: '💓', color: 'text-text-secondary' },
}

function ActivityItem({ activity, isNew }: { activity: ActivityLogType; isNew: boolean }) {
  const config = actionConfig[activity.action]

  return (
    <div
      className={clsx(
        'flex items-start gap-2 py-2 px-3 rounded-lg transition-all duration-300',
        'hover:bg-background/50',
        isNew && 'animate-fade-in-up bg-background/30'
      )}
    >
      <span className="text-sm shrink-0 w-12 font-mono text-text-secondary/60">
        {formatTime(activity.created_at)}
      </span>
      <span className="shrink-0" role="img" aria-label={activity.action}>
        {config.icon}
      </span>
      <p className={clsx('text-sm flex-1 min-w-0 break-words', config.color)}>
        {activity.summary}
      </p>
    </div>
  )
}

export function ActivityLog({ activities }: ActivityLogProps) {
  return (
    <aside className="w-full lg:w-[320px] bg-panel border-t lg:border-t-0 lg:border-l border-border flex flex-col shrink-0">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-text-primary flex items-center gap-2">
          <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Aktivitetslogg
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-border/50 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-text-secondary text-sm">Ingen aktivitet ännu</p>
            <p className="text-text-secondary/60 text-xs mt-1">
              Aktiviteter loggas här
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {activities.map((activity, index) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                isNew={index === 0}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
