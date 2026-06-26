import { useState, useEffect, useRef, useCallback } from 'react'
import type { Task, TimerMode, TimerPhase, TimerSettings } from '../../types/index'

const PRESETS: Record<TimerMode, { workDuration: number; breakDuration: number; sessions: number }> = {
  pomodoro: { workDuration: 25, breakDuration: 5, sessions: 4 },
  deepwork: { workDuration: 90, breakDuration: 20, sessions: 2 },
  custom: { workDuration: 25, breakDuration: 5, sessions: 4 },
}

const ALARM_SOUNDS: { label: string; src: string }[] = [
  { label: 'Bell', src: 'https://cdn.pixabay.com/audio/2022/03/15/audio_8cb749cf5c.mp3' },
  { label: 'Chime', src: 'https://cdn.pixabay.com/audio/2022/03/24/audio_c8f0baa921.mp3' },
  { label: 'Beep', src: 'https://cdn.pixabay.com/audio/2021/08/04/audio_c6ccae8b39.mp3' },
]

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

interface TimerProps {
  activeTask: Task | null
}

function Timer({ activeTask }: TimerProps) {
  const [mode, setMode] = useState<TimerMode>('pomodoro')
  const [settings, setSettings] = useState<TimerSettings>({ ...PRESETS.pomodoro, mode: 'pomodoro' })
  const [phase, setPhase] = useState<TimerPhase>('work')
  const [secondsLeft, setSecondsLeft] = useState(PRESETS.pomodoro.workDuration * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [currentSession, setCurrentSession] = useState(1)
  const [alarmIndex, setAlarmIndex] = useState(0)
  const [alarmRinging, setAlarmRinging] = useState(false)

  const [customWork, setCustomWork] = useState('25')
  const [customBreak, setCustomBreak] = useState('5')
  const [customSessions, setCustomSessions] = useState('4')

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const alarmRef = useRef<HTMLAudioElement | null>(null)

  const triggerAlarm = useCallback(() => {
    setIsRunning(false)
    setAlarmRinging(true)
    const audio = new Audio(ALARM_SOUNDS[alarmIndex].src)
    audio.loop = true
    audio.play()
    alarmRef.current = audio
  }, [alarmIndex])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!)
            triggerAlarm()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current!)
    }
    return () => clearInterval(intervalRef.current!)
  }, [isRunning, triggerAlarm])

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode)
    setIsRunning(false)
    setPhase('work')
    setCurrentSession(1)
    clearInterval(intervalRef.current!)
    alarmRef.current?.pause()
    alarmRef.current = null
    setAlarmRinging(false)

    if (newMode === 'custom') {
      setSettings({ mode: 'custom', workDuration: parseInt(customWork) || 1, breakDuration: parseInt(customBreak) || 1, sessions: parseInt(customSessions) || 1 })
      setSecondsLeft((parseInt(customWork) || 1) * 60)
    } else {
      setSettings({ ...PRESETS[newMode], mode: newMode })
      setSecondsLeft(PRESETS[newMode].workDuration * 60)
    }
  }

  const applyCustom = () => {
    const work = parseInt(customWork) || 1
    const brk = parseInt(customBreak) || 1
    const sessions = parseInt(customSessions) || 1
    setSettings({ mode: 'custom', workDuration: work, breakDuration: brk, sessions })
    setSecondsLeft(work * 60)
    setPhase('work')
    setCurrentSession(1)
    setIsRunning(false)
  }

  const advanceSession = () => {
    if (phase === 'work') {
      if (currentSession >= settings.sessions) {
        setCurrentSession(1)
        setPhase('work')
        setSecondsLeft(settings.workDuration * 60)
      } else {
        setPhase('break')
        setSecondsLeft(settings.breakDuration * 60)
      }
    } else {
      setCurrentSession((prev) => prev + 1)
      setPhase('work')
      setSecondsLeft(settings.workDuration * 60)
    }
  }

  const stopAlarm = () => {
    alarmRef.current?.pause()
    alarmRef.current = null
    setAlarmRinging(false)
    advanceSession()
  }

  const handleStartPause = () => {
    if (alarmRinging) return
    setIsRunning((prev) => !prev)
  }

  const handleReset = () => {
    clearInterval(intervalRef.current!)
    alarmRef.current?.pause()
    alarmRef.current = null
    setAlarmRinging(false)
    setIsRunning(false)
    setPhase('work')
    setCurrentSession(1)
    setSecondsLeft(settings.workDuration * 60)
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <h2
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: 'var(--color-muted)' }}
      >
        Timer
      </h2>

      {/* Active Task Display */}
      <div
        className="px-3 py-2.5 rounded-xl text-sm"
        style={{
          backgroundColor: 'var(--color-bg)',
          border: `1px solid ${activeTask ? 'var(--color-accent)' : 'var(--color-border)'}`,
          color: activeTask ? 'var(--color-accent)' : 'var(--color-muted)',
        }}
      >
        {activeTask ? (
          <span className="font-medium">↳ {activeTask.text}</span>
        ) : (
          <span>No task selected</span>
        )}
      </div>

      {/* Mode Selector */}
      <div
        className="flex gap-1 p-1 rounded-xl"
        style={{
          backgroundColor: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
        }}
      >
        {(['pomodoro', 'deepwork', 'custom'] as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className="flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            style={{
              backgroundColor: mode === m ? 'var(--color-accent)' : 'transparent',
              color: mode === m ? '#fff' : 'var(--color-muted)',
            }}
          >
            {m === 'deepwork' ? 'Deep Work' : m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {/* Custom Settings */}
      {mode === 'custom' && (
        <div
          className="flex flex-col gap-3 p-4 rounded-xl"
          style={{
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
          }}
        >
          {[
            { label: 'Work (min)', value: customWork, set: setCustomWork },
            { label: 'Break (min)', value: customBreak, set: setCustomBreak },
            { label: 'Sessions', value: customSessions, set: setCustomSessions },
          ].map(({ label, value, set }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                {label}
              </span>
              <input
                type="number"
                min={1}
                value={value}
                onChange={(e) => set(e.target.value)}
                onFocus={(e) => e.target.select()}
                onBlur={(e) => {
                  const num = parseInt(e.target.value)
                  if (!num || num < 1) set('1')
                }}
                className="w-16 px-2 py-1 rounded-lg text-xs text-center outline-none"
                style={{
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                }}
              />
            </div>
          ))}
          <button
            onClick={applyCustom}
            className="mt-1 py-2 rounded-lg text-xs font-semibold text-white cursor-pointer"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            Apply
          </button>
        </div>
      )}

      {/* Phase + Session */}
      <p
        className="text-xs text-center uppercase tracking-widest"
        style={{ color: 'var(--color-muted)' }}
      >
        {phase === 'work' ? 'Focus' : 'Break'} · Session {currentSession} of {settings.sessions}
      </p>

      {/* Timer Display */}
      <div
        className="text-center text-7xl font-bold leading-none"
        style={{
          fontFamily: 'var(--font-mono)',
          color: alarmRinging ? '#e53e3e' : 'var(--color-text)',
          letterSpacing: '-2px',
        }}
      >
        {formatTime(secondsLeft)}
      </div>

      {/* Controls */}
      <div className="flex gap-2 mt-1">
        {alarmRinging ? (
          <button
            onClick={stopAlarm}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer"
            style={{ backgroundColor: '#e53e3e' }}
          >
            Stop Alarm
          </button>
        ) : (
          <button
            onClick={handleStartPause}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            {isRunning ? 'Pause' : 'Start'}
          </button>
        )}
        <button
          onClick={handleReset}
          className="px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
          style={{
            border: '1px solid var(--color-border)',
            color: 'var(--color-muted)',
            backgroundColor: 'var(--color-bg)',
          }}
        >
          Reset
        </button>
      </div>

      {/* Alarm Sound */}
      <div className="flex flex-col gap-2">
        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
          Alarm
        </p>
        <div className="flex gap-2">
          {ALARM_SOUNDS.map((sound, i) => (
            <button
              key={sound.label}
              onClick={() => setAlarmIndex(i)}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors"
              style={{
                backgroundColor: alarmIndex === i ? 'var(--color-accent)' : 'var(--color-bg)',
                color: alarmIndex === i ? '#fff' : 'var(--color-muted)',
                border: '1px solid var(--color-border)',
              }}
            >
              {sound.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}

export default Timer