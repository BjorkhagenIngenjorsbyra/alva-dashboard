'use client'

import type { AlvaStatus } from '@/lib/types'
import { formatRelativeTime } from '@/utils/formatters'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface StatusBarProps {
  status: AlvaStatus
  lastActive: string | null
}

const statusConfig: Record<AlvaStatus, { label: string; color: string; dot: string }> = {
  online: {
    label: 'Online',
    color: 'text-success',
    dot: 'bg-success',
  },
  thinking: {
    label: 'Tänker',
    color: 'text-thought',
    dot: 'bg-thought animate-pulse',
  },
  offline: {
    label: 'Offline',
    color: 'text-text-secondary',
    dot: 'bg-text-secondary',
  },
}

export function StatusBar({ status, lastActive }: StatusBarProps) {
  const config = statusConfig[status]
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="h-14 bg-panel border-b border-border px-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <span className="font-semibold text-text-primary">Alva Dashboard</span>
        </div>

        <div className="h-4 w-px bg-border" />

        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${config.dot}`} />
          <span className={`text-sm font-medium ${config.color}`}>
            {config.label}
          </span>
        </div>

        {lastActive && (
          <>
            <div className="h-4 w-px bg-border" />
            <span className="text-sm text-text-secondary">
              Senast aktiv: {formatRelativeTime(lastActive)}
            </span>
          </>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        Logga ut
      </button>
    </header>
  )
}
