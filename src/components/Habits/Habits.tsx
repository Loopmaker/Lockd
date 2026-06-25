import { useState } from 'react'
import useLocalStorage from '../../hooks/useLocalStorage'
import type { Habit } from '../../types/index'

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function getLast90Days(): string[] {
  const days: string[] = []
  for (let i = 89; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

function getStreak(completedDates: string[]): number {
  let streak = 0
  const today = new Date()

  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const str = d.toISOString().split('T')[0]
    if (completedDates.includes(str)) {
      streak++
    } else {
      break
    }
  }
  return streak
}

function Habits() {
  const [habits, setHabits] = useLocalStorage<Habit[]>('lockd-habits', [])
  const [input, setInput] = useState('')

  const today = getTodayStr()
  const last90 = getLast90Days()

  const addHabit = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name: trimmed,
      completedDates: [],
    }
    setHabits((prev) => [...prev, newHabit])
    setInput('')
  }

  const toggleToday = (id: string) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== id) return habit
        const alreadyDone = habit.completedDates.includes(today)
        return {
          ...habit,
          completedDates: alreadyDone
            ? habit.completedDates.filter((d) => d !== today)
            : [...habit.completedDates, today],
        }
      })
    )
  }

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id))
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto py-8">

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Add a habit..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addHabit()}
          className="flex-1 px-4 py-2 rounded-lg text-sm outline-none"
          style={{
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
          }}
        />
        <button
          onClick={addHabit}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white cursor-pointer"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          Add
        </button>
      </div>

      {/* Habit List */}
      {habits.length === 0 && (
        <p className="text-sm text-center py-12" style={{ color: 'var(--color-muted)' }}>
          No habits yet. Add one above.
        </p>
      )}

      {habits.map((habit) => {
        const doneToday = habit.completedDates.includes(today)
        const streak = getStreak(habit.completedDates)

        return (
          <div
            key={habit.id}
            className="flex flex-col gap-3 p-4 rounded-lg"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            {/* Habit Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Today toggle */}
                <button
                  onClick={() => toggleToday(habit.id)}
                  className="w-5 h-5 rounded-full border-2 shrink-0 cursor-pointer transition-colors"
                  style={{
                    borderColor: 'var(--color-accent)',
                    backgroundColor: doneToday ? 'var(--color-accent)' : 'transparent',
                  }}
                  title="Toggle today"
                />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  {habit.name}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Streak */}
                <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                  {streak > 0 ? `${streak} day streak` : 'No streak'}
                </span>
                {/* Delete */}
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="text-xs cursor-pointer"
                  style={{ color: 'var(--color-muted)' }}
                >
                  Remove
                </button>
              </div>
            </div>

            {/* Contribution Grid */}
            <div className="flex flex-wrap gap-[3px]">
              {last90.map((day) => {
                const done = habit.completedDates.includes(day)
                const isToday = day === today
                return (
                  <div
                    key={day}
                    title={day}
                    className="w-3 h-3 rounded-sm"
                    style={{
                      backgroundColor: done
                        ? 'var(--color-accent)'
                        : 'var(--color-border)',
                      outline: isToday ? '1px solid var(--color-accent)' : 'none',
                    }}
                  />
                )
              })}
            </div>

          </div>
        )
      })}

    </div>
  )
}

export default Habits