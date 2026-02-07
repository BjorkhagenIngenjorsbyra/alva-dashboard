'use client'

import { useEffect, useRef } from 'react'
import type { Task, ThoughtLog } from '@/lib/types'
import { ThoughtCard } from './ThoughtCard'

interface ThoughtStreamProps {
  activeTask: Task | null
  thoughts: ThoughtLog[]
  tasks: Task[]
}

export function ThoughtStream({ activeTask, thoughts, tasks }: ThoughtStreamProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const prevThoughtsLength = useRef(thoughts.length)

  const displayTask = activeTask || tasks.find((t) => t.status === 'completed')
  const displayThoughts = displayTask
    ? thoughts.filter((t) => t.task_id === displayTask.id)
    : []

  useEffect(() => {
    if (containerRef.current && thoughts.length > prevThoughtsLength.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
    prevThoughtsLength.current = thoughts.length
  }, [thoughts.length])

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-panel/50">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-text-primary flex items-center gap-2">
          <svg className="w-5 h-5 text-thought" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Tankeström
        </h2>
        {displayTask && (
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${activeTask ? 'bg-thought animate-pulse' : 'bg-success'}`} />
            <span className="text-sm text-text-secondary truncate max-w-[300px]">
              {displayTask.title}
            </span>
          </div>
        )}
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin"
      >
        {displayThoughts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-border/50 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-text-secondary text-sm">
              {displayTask ? 'Inga tankar loggade för denna uppgift' : 'Ingen aktiv uppgift'}
            </p>
            <p className="text-text-secondary/60 text-xs mt-1">
              Tankarna visas här när Alva arbetar
            </p>
          </div>
        ) : (
          displayThoughts.map((thought, index) => (
            <ThoughtCard
              key={thought.id}
              thought={thought}
              isNew={index === displayThoughts.length - 1}
            />
          ))
        )}
      </div>
    </main>
  )
}
