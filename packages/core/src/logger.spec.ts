import {
  MockInstance,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest'
import { createVars } from './test-helper'
import { Logger } from './logger'
import { Timer } from './timer'
import { LoggerInterface, LoggerProvider } from '.'
import path from 'path'

const vars = createVars<{
  logger?: LoggerInterface
  spy?: MockInstance
  now?: Date
}>({})

class TestProvider implements LoggerProvider {
  output(): void {}
}

describe('logone/logger', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
    vi.clearAllTimers()
  })

  beforeEach(() => {
    const now = new Date(2023, 1, 1, 13)
    vars.set('now', now)
    vi.setSystemTime(now)
  })

  describe('simple use', () => {
    beforeEach(() => {
      const provider = new TestProvider()
      const spy = vi.spyOn(provider, 'output')
      vars.set('logger', new Logger(new Timer(), { type: 'test' }, provider))
      vars.set('spy', spy)
    })

    describe('info', () => {
      beforeEach(() => {
        const logger = vars.get('logger')
        if (!logger) return

        logger.start()
        logger.info('%s, world', 'hello')
        logger.finish()
      })
      it('should be call output', () => {
        expect(vars.get('spy')).toHaveBeenCalledTimes(1)
        expect(vars.get('spy')).toHaveBeenCalledWith({
          type: 'test',
          context: {},
          runtime: {
            severity: 'INFO',
            startTime: vars.get('now'),
            endTime: vars.get('now'),
            elapsed: 0,
            lines: [
              {
                severity: 'INFO',
                message: 'hello, world',
                time: vars.get('now'),
                fileLine: 56,
                fileName: `${path.join(__dirname, 'logger.spec.ts')}`
              }
            ]
          },
          config: {}
        })
      })
    })

    describe('with debug', () => {
      beforeEach(() => {
        const logger = vars.get('logger')
        if (!logger) return

        logger.start()
        logger.info('%s, world', 'hello')
        logger.debug('debug')
        logger.finish()
      })
      it('should be call output', () => {
        expect(vars.get('spy')).toHaveBeenCalledTimes(1)
        expect(vars.get('spy')).toHaveBeenCalledWith({
          type: 'test',
          context: {},
          runtime: {
            severity: 'INFO',
            startTime: vars.get('now'),
            endTime: vars.get('now'),
            elapsed: 0,
            lines: [
              {
                severity: 'INFO',
                message: 'hello, world',
                time: vars.get('now'),
                fileLine: 90,
                fileName: `${path.join(__dirname, 'logger.spec.ts')}`
              },
              {
                severity: 'DEBUG',
                message: 'debug',
                time: vars.get('now'),
                fileLine: 91,
                fileName: `${path.join(__dirname, 'logger.spec.ts')}`
              }
            ]
          },
          config: {}
        })
      })
    })

    describe('with warn', () => {
      beforeEach(() => {
        const logger = vars.get('logger')
        if (!logger) return

        logger.start()
        logger.info('%s, world', 'hello')
        logger.warning('warning')
        logger.finish()
      })
      it('should be call output', () => {
        expect(vars.get('spy')).toHaveBeenCalledTimes(1)
        expect(vars.get('spy')).toHaveBeenCalledWith({
          type: 'test',
          context: {},
          runtime: {
            severity: 'WARNING',
            startTime: vars.get('now'),
            endTime: vars.get('now'),
            elapsed: 0,
            lines: [
              {
                severity: 'INFO',
                message: 'hello, world',
                time: vars.get('now'),
                fileLine: 132,
                fileName: `${path.join(__dirname, 'logger.spec.ts')}`
              },
              {
                severity: 'WARNING',
                message: 'warning',
                time: vars.get('now'),
                fileLine: 133,
                fileName: `${path.join(__dirname, 'logger.spec.ts')}`
              }
            ]
          },
          config: {}
        })
      })
    })
    describe('with error', () => {
      it.todo(() => {})
    })
  })
})
