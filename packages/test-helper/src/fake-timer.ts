import { vi } from 'vitest'

class FakeTimer {
  private start: Date

  constructor() {
    this.start = new Date()
  }

  get current() {
    return new Date()
  }

  setup() {
    if (vi.isFakeTimers()) return
    vi.useFakeTimers()
    vi.setSystemTime(this.start)
  }

  clear() {
    vi.clearAllTimers()
    vi.useRealTimers()
  }

  after(milliseconds: number) {
    const next = new Date(new Date().getTime() + milliseconds)
    vi.setSystemTime(next)
  }

  before(milliseconds: number) {
    const prev = new Date(new Date().getTime() - milliseconds)
    vi.setSystemTime(prev)
  }

  fromStartingTimeAt(milliseconds: number) {
    return new Date(this.start.getTime() + milliseconds)
  }
}

function fakeTimer() {
  return new FakeTimer()
}

export { fakeTimer }
