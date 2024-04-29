import { LoggerConfigTimer } from './interface'

export class Timer {
  private startAt: number | null = null
  private endAt: number | null = null

  constructor(private config: LoggerConfigTimer) {}

  get startTime() {
    if (!this.startAt) {
      throw new Error('Logger Timer is not started')
    }
    return new Date(this.startAt)
  }

  get endTime() {
    if (!this.endAt) {
      throw new Error('Logger Timer is not ended')
    }
    return new Date(this.endAt)
  }

  get currentTime() {
    return new Date()
  }

  get elapsed() {
    if (!this.startAt) {
      throw new Error('Logger Timer is not started')
    }
    const current = this.endAt ? this.endAt : this.currentTime.getTime()
    const diff = current - this.startAt
    return diff
  }

  start() {
    this.startAt = this.currentTime.getTime()
  }

  end() {
    this.endAt = this.currentTime.getTime()
  }
}
