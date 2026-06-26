import { useState } from 'react'
import useLocalStorage from './hooks/useLocalStorage'
import type { Task, CompletedTask } from './types/index'
import Timer from './components/Timer/Timer'
import Tasks from './components/Tasks/Tasks'
import History from './components/History/History'

function App() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('lockd-tasks', [])
  const [completed, setCompleted] = useLocalStorage<CompletedTask[]>('lockd-completed', [])
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)

  const activeTask = tasks.find((t) => t.id === activeTaskId) ?? null

  const completeTask = (id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return

    const completedTask: CompletedTask = {
      id: task.id,
      text: task.text,
      completedAt: Date.now(),
    }

    setCompleted((prev) => [completedTask, ...prev])
    setTasks((prev) => prev.filter((t) => t.id !== id))
    if (activeTaskId === id) setActiveTaskId(null)
  }

  const clearHistory = () => setCompleted([])

  return (
    <div
      className="min-h-screen w-full"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >

      {/* Header */}
      <header
        className="px-8 py-5 border-b flex items-center justify-between w-full"
        style={{ borderColor: 'var(--color-border)' }}
        >
        <div className="flex items-center gap-2">
          <span
            className="text-lg font-bold tracking-tight"
            style={{ color: 'var(--color-text)' }}
          >
            Lockd
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-muted)',
            }}
          >
            mvps
          </span>
        </div>
        <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
          {tasks.length} task{tasks.length !== 1 ? 's' : ''} remaining
        </span>
      </header>

      {/* Main */}
      <main className="w-full max-w-6xl mx-auto px-8 py-8 flex flex-col gap-4 items-stretch">

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full flex-1">

          {/* Tasks Panel */}
          <div
            className="rounded-2xl p-6 w-full"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <Tasks
              tasks={tasks}
              setTasks={setTasks}
              activeTaskId={activeTaskId}
              setActiveTaskId={setActiveTaskId}
              onComplete={completeTask}
            />
          </div>

          {/* Timer Panel */}
          <div
            className="rounded-2xl p-6 w-full"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <Timer activeTask={activeTask} />
          </div>

        </div>

        {/* History Panel */}
        {completed.length > 0 && (
          <div
            className="rounded-2xl p-6"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <History completed={completed} onClear={clearHistory} />
          </div>
        )}

      </main>

    </div>
  )
}

export default App