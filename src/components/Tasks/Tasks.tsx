import { useState } from 'react'
import useLocalStorage from '../../hooks/useLocalStorage'
import type { Task } from '../../types/index'

function Tasks() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('lockd-tasks', [])
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

  const completeTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto py-8">

      {/* Input */}
      <div
        className="flex gap-2"
      >
        <input
          type="text"
          placeholder="Add a task..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          className="flex-1 px-4 py-2 rounded-lg text-sm outline-none"
          style={{
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
          }}
        />
        <button
          onClick={addTask}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white cursor-pointer"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          Add
        </button>
      </div>

      {/* Task List */}
      <div className="flex flex-col gap-2">
        {tasks.length === 0 && (
          <p className="text-sm text-center py-12" style={{ color: 'var(--color-muted)' }}>
            No tasks yet. Add one above.
          </p>
        )}
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 px-4 py-3 rounded-lg"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            {/* Checkbox */}
            <button
              onClick={() => completeTask(task.id)}
              className="w-5 h-5 rounded-full border-2 shrink-0 cursor-pointer transition-colors"
              style={{ borderColor: 'var(--color-accent)' }}
              title="Mark as complete"
            />
            <span className="text-sm flex-1" style={{ color: 'var(--color-text)' }}>
              {task.text}
            </span>
          </div>
        ))}
      </div>

    </div>
  )
}

export default Tasks