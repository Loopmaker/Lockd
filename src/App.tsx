import { useState } from 'react'
import Timer from './components/Timer/Timer'
import Tasks from './components/Tasks/Tasks'
import Notes from './components/Notes/Notes'
import Habits from './components/Habits/Habits'

type Tab = 'timer' | 'tasks' | 'notes' | 'habits'

const tabs: { id: Tab; label: string }[] = [
  { id: 'timer', label: 'Timer' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'notes', label: 'Notes' },
  { id: 'habits', label: 'Habits' },
]

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('timer')

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>

      {/* Header */}
      <header
        className="border-b px-6 py-4 flex items-center justify-between"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <h1
          className="text-xl font-bold tracking-tight"
          style={{ color: 'var(--color-text)' }}
        >
          Lockd
        </h1>
      </header>

      {/* Tab Navigation */}
      <nav
        className="border-b px-6 flex gap-1"
        style={{ borderColor: 'var(--color-border)' }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-3 text-sm font-medium transition-colors cursor-pointer"
            style={{
              color: activeTab === tab.id ? 'var(--color-accent)' : 'var(--color-muted)',
              borderBottom: activeTab === tab.id ? '2px solid var(--color-accent)' : '2px solid transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {activeTab === 'timer' && <Timer />}
        {activeTab === 'tasks' && <Tasks />}
        {activeTab === 'notes' && <Notes />}
        {activeTab === 'habits' && <Habits />}
      </main>

    </div>
  )
}

export default App