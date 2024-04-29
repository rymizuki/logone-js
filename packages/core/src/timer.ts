export class Timer {
  public startAt: number | null = null
  public endAt: number | null = null

  constructor(
    private config: { elapsedUnit: '1ms' } = { elapsedUnit: '1ms' }
  ) {}

  get startTime() {
    if (!this.startAt) {
      throw new Error('LoggerTime is not started')
    }
    return new Date(this.startAt)
  }

  get endTime() {
    if (!this.endAt) {
      throw new Error('LoggerTime is not finished')
    }
    return new Date(this.endAt)
  }

  get currentTime() {
    return new Date()
  }

  get elapsed() {
    if (!this.startAt) {
      throw new Error('LoggerTimer is not started')
    }
    const current = this.endAt ? this.endAt : this.currentTime.getTime()
    const diff = current - this.startAt
    return diff
  }

  start() {
    this.startAt = new Date().getTime()
  }

  finish() {
    this.endAt = new Date().getTime()
  }
}
