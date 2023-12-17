import path from 'path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LoggerAdapter, LoggerProvider } from '.'
import { LoggerManager } from './manager'

const adapter: LoggerAdapter = {
  type: 'test'
}

const provider = (() => {
  class TestProvider implements LoggerProvider {
    output(): void {
      return
    }
  }
  return new TestProvider()
})()

describe('logone/manager', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
    vi.clearAllTimers()
  })

  describe('recording', () => {
    it('should be start logging', () => {
      const now = new Date(2023, 1, 1, 12)
      vi.setSystemTime(now)

      const manager = new LoggerManager(adapter, provider)
      const [logger, finish] = manager.recording()
      const spy = vi.spyOn(provider, 'output')

      logger.info('test info')
      logger.debug('test debug')

      finish()
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith({
        type: 'test',
        context: {},
        runtime: {
          severity: 'INFO',
          startTime: now,
          endTime: now,
          elapsed: 0,
          lines: [
            {
              severity: 'INFO',
              message: 'test info',
              time: now,
              fileName: path.join(__dirname, 'manager.spec.ts'),
              fileLine: 52
            },
            {
              severity: 'DEBUG',
              message: 'test debug',
              time: now,
              fileName: path.join(__dirname, 'manager.spec.ts'),
              fileLine: 53
            }
          ]
        },
        config: {}
      })
    })
  })
})
