export interface Task {
  id: string
  text: string
  createdAt: number
}

export interface CompletedTask {
  id: string
  text: string
  completedAt: number
}

export type TimerMode = 'pomodoro' | 'deepwork' | 'custom'
export type TimerPhase = 'work' | 'break'

export interface TimerSettings {
  mode: TimerMode
  workDuration: number
  breakDuration: number
  sessions: number
}