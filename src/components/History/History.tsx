import type { CompletedTask } from '../../types/index'

interface HistoryProps {
  completed: CompletedTask[]
  onClear: () => void
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function History({ completed, onClear }: HistoryProps) {
  if (completed.length === 0) return null

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'var(--color-muted)' }}
          >
            Completed
          </h2>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-muted)',
            }}
          >
            {completed.length}
          </span>
        </div>
        <button
          onClick={onClear}
          className="text-xs cursor-pointer transition-colors hover:underline"
          style={{ color: 'var(--color-muted)' }}
        >
          Clear all
        </button>
      </div>

      {/* List */}
      <div className="flex flex-col gap-2">
        {completed.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between px-3 py-3 rounded-xl"
            style={{
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="flex items-center gap-3">
              {/* Done indicator */}
              <div
                className="w-[18px] h-[18px] rounded-full flex-shrink-0 flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-accent)' }}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 5L4 7L8 3"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span
                className="text-sm line-through"
                style={{ color: 'var(--color-muted)' }}
              >
                {task.text}
              </span>
            </div>
            <span
              className="text-xs flex-shrink-0 ml-4"
              style={{ color: 'var(--color-muted)' }}
            >
              {formatDate(task.completedAt)}
            </span>
          </div>
        ))}
      </div>

    </div>
  )
}

export default History