import { useState, useEffect, useRef } from 'react'
import type { TimerMode, TimerPhase, TimerSettings } from '../../types/index'

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

function Timer() {
  const [mode, setMode] = useState<TimerMode>('pomodoro')
  const [settings, setSettings] = useState<TimerSettings>({ ...PRESETS.pomodoro, mode: 'pomodoro' })
  const [phase, setPhase] = useState<TimerPhase>('work')
  const [secondsLeft, setSecondsLeft] = useState(PRESETS.pomodoro.workDuration * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [currentSession, setCurrentSession] = useState(1)
  const [alarmIndex, setAlarmIndex] = useState(0)
  const [alarmRinging, setAlarmRinging] = useState(false)

  // custom inputs
  const [customWork, setCustomWork] = useState(25)
  const [customBreak, setCustomBreak] = useState(5)
  const [customSessions, setCustomSessions] = useState(4)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const alarmRef = useRef<HTMLAudioElement | null>(null)

  // switch mode
  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode)
    setIsRunning(false)
    setPhase('work')
    setCurrentSession(1)
    clearInterval(intervalRef.current!)

    if (newMode === 'custom') {
      setSettings({ mode: 'custom', workDuration: customWork, breakDuration: customBreak, sessions: customSessions })
      setSecondsLeft(customWork * 60)
    } else {
      setSettings({ ...PRESETS[newMode], mode: newMode })
      setSecondsLeft(PRESETS[newMode].workDuration * 60)
    }
  }

  // apply custom settings
  const applyCustom = () => {
    setSettings({ mode: 'custom', workDuration: customWork, breakDuration: customBreak, sessions: customSessions })
    setSecondsLeft(customWork * 60)
    setPhase('work')
    setCurrentSession(1)
    setIsRunning(false)
  }
  
  const triggerAlarm = () => {
    setIsRunning(false)
    setAlarmRinging(true)
    const audio = new Audio(ALARM_SOUNDS[alarmIndex].src)
    audio.loop = true
    audio.play()
    alarmRef.current = audio
  }

  // countdown
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
  }, [isRunning])



  const stopAlarm = () => {
    alarmRef.current?.pause()
    alarmRef.current = null
    setAlarmRinging(false)
    advanceSession()
  }

  const advanceSession = () => {
    if (phase === 'work') {
      if (currentSession >= settings.sessions) {
        // all sessions done, reset
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
    <div className="flex flex-col items-center gap-8 py-8">

      {/* Mode Selector */}
      <div
        className="flex gap-1 p-1 rounded-lg"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        {(['pomodoro', 'deepwork', 'custom'] as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className="px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer capitalize"
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
          className="flex flex-col gap-3 w-full max-w-sm p-4 rounded-lg"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          {[
            { label: 'Work (min)', value: customWork, set: setCustomWork },
            { label: 'Break (min)', value: customBreak, set: setCustomBreak },
            { label: 'Sessions', value: customSessions, set: setCustomSessions },
          ].map(({ label, value, set }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--color-muted)' }}>{label}</span>
              <input
                type="number"
                min={1}
                value={value}
                onChange={(e) => set(Number(e.target.value))}
                className="w-20 px-2 py-1 rounded text-sm text-center outline-none"
                style={{
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text)',
                }}
              />
            </div>
          ))}
          <button
            onClick={applyCustom}
            className="mt-1 py-2 rounded-md text-sm font-medium text-white cursor-pointer"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            Apply
          </button>
        </div>
      )}

      {/* Phase + Session */}
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
          {phase === 'work' ? 'Focus' : 'Break'} · Session {currentSession} of {settings.sessions}
        </p>
      </div>

      {/* Timer Display */}
      <div
        className="text-8xl font-bold tracking-tight"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}
      >
        {formatTime(secondsLeft)}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {alarmRinging ? (
          <button
            onClick={stopAlarm}
            className="px-8 py-3 rounded-lg text-sm font-semibold text-white cursor-pointer"
            style={{ backgroundColor: '#e53e3e' }}
          >
            Stop Alarm
          </button>
        ) : (
          <button
            onClick={handleStartPause}
            className="px-8 py-3 rounded-lg text-sm font-semibold text-white cursor-pointer"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            {isRunning ? 'Pause' : 'Start'}
          </button>
        )}
        <button
          onClick={handleReset}
          className="px-6 py-3 rounded-lg text-sm font-semibold cursor-pointer"
          style={{
            border: '1px solid var(--color-border)',
            color: 'var(--color-muted)',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          Reset
        </button>
      </div>

      {/* Alarm Sound Selector */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Alarm Sound</p>
        <div className="flex gap-2">
          {ALARM_SOUNDS.map((sound, i) => (
            <button
              key={sound.label}
              onClick={() => setAlarmIndex(i)}
              className="px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors"
              style={{
                backgroundColor: alarmIndex === i ? 'var(--color-accent)' : 'var(--color-surface)',
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