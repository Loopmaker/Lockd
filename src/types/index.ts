export interface Task {
  id: string
  text: string
  createdAt: number
}

export interface Habit {
  id: string
  name: string
  completedDates: string[] // stored as 'YYYY-MM-DD' strings
}

export type TimerMode = 'pomodoro' | 'deepwork' | 'custom'

export type TimerPhase = 'work' | 'break'

export interface TimerSettings {
  mode: TimerMode
  workDuration: number  // in minutes
  breakDuration: number // in minutes
  sessions: number      // how many sessions to run
}