import { useState } from 'react'
import type { Task } from '../../types/index'

interface TasksProps {
  tasks: Task[]
  setTasks: (tasks: Task[] | ((prev: Task[]) => Task[])) => void
  activeTaskId: string | null
  setActiveTaskId: (id: string | null) => void
  onComplete: (id: string) => void
}

function Tasks({ tasks, setTasks, activeTaskId, setActiveTaskId, onComplete }: TasksProps) {
  const [input, setInput] = useState('')

  const addTask = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: trimmed,
      createdAt: Date.now(),
    }
    setTasks((prev) => [newTask, ...prev])
    setInput('')
  }

  const handleSelect = (id: string) => {
    setActiveTaskId(activeTaskId === id ? null : id)
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--color-muted)' }}
        >
          Tasks
        </h2>
        {tasks.length > 0 && (
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-muted)',
            }}
          >
            {tasks.length}
          </span>
        )}
      </div>

      {/* Input */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl"
        style={{
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg)',
        }}
      >
        <input
          type="text"
          placeholder="What needs to get done?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          className="flex-1 text-sm outline-none bg-transparent"
          style={{ color: 'var(--color-text)' }}
        />
        <button
          onClick={addTask}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white cursor-pointer transition-opacity"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          Add
        </button>
      </div>

      {/* Task List */}
      <div className="flex flex-col gap-2">
        {tasks.length === 0 && (
          <p
            className="text-sm text-center py-10"
            style={{ color: 'var(--color-muted)' }}
          >
            No tasks yet.
          </p>
        )}

        {tasks.map((task) => {
          const isActive = task.id === activeTaskId
          return (
            <div
              key={task.id}
              className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all"
              style={{
                border: `1px solid ${isActive ? 'var(--color-accent)' : 'var(--color-border)'}`,
                backgroundColor: isActive ? '#f2fbf2' : 'var(--color-bg)',
              }}
            >
              {/* Complete button */}
              <button
                onClick={() => onComplete(task.id)}
                className="w-4.5 h-4.5 rounded-full border-2 shrink-0 cursor-pointer hover:bg-green-100 transition-colors"
                style={{ borderColor: 'var(--color-accent)' }}
                title="Mark complete"
              />

              {/* Task text */}
              <span
                onClick={() => handleSelect(task.id)}
                className="text-sm flex-1 cursor-pointer select-none"
                style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-text)' }}
              >
                {task.text}
              </span>

              {/* Active badge */}
              {isActive && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                  style={{
                    backgroundColor: 'var(--color-accent)',
                    color: '#fff',
                  }}
                >
                  active
                </span>
              )}
            </div>
          )
        })}
      </div>

    </div>
  )
}

export default Tasks