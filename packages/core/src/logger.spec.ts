import { vars } from '@logone/test-helper'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LoggerInterface } from './interface'
import { Logger } from './logger'
import { Stacker } from './stacker'
import { Timer } from './timer'

const v = vars<{
  logger: LoggerInterface
  stacker: Stacker
  timer: Timer
}>()

describe('Logger', () => {
  beforeEach(() => {
    const timer = new Timer({
      elapsedUnit: '1ms'
    })
    const stacker = new Stacker()
    v.set('timer', timer)
    v.set('stacker', stacker)
    v.set('logger', new Logger(timer, stacker))
    vi.setSystemTime(new Date())
    vi.isFakeTimers()
  })
  afterEach(() => {
    v.clear()
  })

  describe('.debug', () => {
    describe('message only', () => {
      it('should be stack record', () => {
        v.get('logger')?.debug('hello')
        expect(v.get('stacker')?.entries).toStrictEqual([
          {
            fileLine: 33,
            fileName: __filename,
            funcName: null,
            message: 'hello',
            payload: [],
            severity: 'DEBUG',
            time: v.get('timer')?.currentTime
          }
        ])
      })
    })
    describe('message with payload', () => {
      it('should be stack record', () => {
        v.get('logger')?.debug('hello', 1, { message: 'hello' })
        expect(v.get('stacker')?.entries).toStrictEqual([
          {
            fileLine: 49,
            fileName: __filename,
            funcName: null,
            message: 'hello',
            payload: [1, { message: 'hello' }],
            severity: 'DEBUG',
            time: v.get('timer')?.currentTime
          }
        ])
      })
    })
  })
  describe('.info', () => {
    describe('message only', () => {
      it('should be stack record', () => {
        v.get('logger')?.info('hello')
        expect(v.get('stacker')?.entries).toStrictEqual([
          {
            fileLine: 67,
            fileName: __filename,
            funcName: null,
            message: 'hello',
            payload: [],
            severity: 'INFO',
            time: v.get('timer')?.currentTime
          }
        ])
      })
    })
    describe('message with payload', () => {
      it('should be stack record', () => {
        v.get('logger')?.info('hello', 1, { message: 'hello' })
        expect(v.get('stacker')?.entries).toStrictEqual([
          {
            fileLine: 83,
            fileName: __filename,
            funcName: null,
            message: 'hello',
            payload: [1, { message: 'hello' }],
            severity: 'INFO',
            time: v.get('timer')?.currentTime
          }
        ])
      })
    })
  })
  describe('.warning', () => {
    describe('message only', () => {
      it('should be stack record', () => {
        v.get('logger')?.warning('hello')
        expect(v.get('stacker')?.entries).toStrictEqual([
          {
            fileLine: 101,
            fileName: __filename,
            funcName: null,
            message: 'hello',
            payload: [],
            severity: 'WARNING',
            time: v.get('timer')?.currentTime
          }
        ])
      })
    })
    describe('message with payload', () => {
      it('should be stack record', () => {
        v.get('logger')?.warning('hello', 1, { message: 'hello' })
        expect(v.get('stacker')?.entries).toStrictEqual([
          {
            fileLine: 117,
            fileName: __filename,
            funcName: null,
            message: 'hello',
            payload: [1, { message: 'hello' }],
            severity: 'WARNING',
            time: v.get('timer')?.currentTime
          }
        ])
      })
    })
  })
  describe('.error', () => {
    describe('message only', () => {
      it('should be stack record', () => {
        v.get('logger')?.error('hello')
        expect(v.get('stacker')?.entries).toStrictEqual([
          {
            fileLine: 135,
            fileName: __filename,
            funcName: null,
            message: 'hello',
            payload: [],
            severity: 'ERROR',
            time: v.get('timer')?.currentTime
          }
        ])
      })
    })
    describe('message with payload', () => {
      it('should be stack record', () => {
        v.get('logger')?.error('hello', 1, { message: 'hello' })
        expect(v.get('stacker')?.entries).toStrictEqual([
          {
            fileLine: 151,
            fileName: __filename,
            funcName: null,
            message: 'hello',
            payload: [1, { message: 'hello' }],
            severity: 'ERROR',
            time: v.get('timer')?.currentTime
          }
        ])
      })
    })
  })
  describe('.critical', () => {
    describe('message only', () => {
      it('should be stack record', () => {
        v.get('logger')?.critical('hello')
        expect(v.get('stacker')?.entries).toStrictEqual([
          {
            fileLine: 169,
            fileName: __filename,
            funcName: null,
            message: 'hello',
            payload: [],
            severity: 'CRITICAL',
            time: v.get('timer')?.currentTime
          }
        ])
      })
    })
    describe('message with payload', () => {
      it('should be stack record', () => {
        v.get('logger')?.critical('hello', 1, { message: 'hello' })
        expect(v.get('stacker')?.entries).toStrictEqual([
          {
            fileLine: 185,
            fileName: __filename,
            funcName: null,
            message: 'hello',
            payload: [1, { message: 'hello' }],
            severity: 'CRITICAL',
            time: v.get('timer')?.currentTime
          }
        ])
      })
    })
  })
  describe('.error with Error object', () => {
    describe('Error instance as first argument', () => {
      it('should use error.message as message and {error} as payload', () => {
        const error = new Error('Test error message')
        error.cause = 'Test cause'
        v.get('logger')?.error(error)
        expect(v.get('stacker')?.entries).toStrictEqual([
          {
            fileLine: expect.any(Number) as number,
            fileName: __filename,
            funcName: null,
            message: 'Test error message',
            payload: { error },
            severity: 'ERROR',
            time: v.get('timer')?.currentTime
          }
        ])
      })
    })

    describe('Error with additional arguments', () => {
      it('should include additional arguments in payload', () => {
        const error = new Error('Test error message')
        v.get('logger')?.error(error, 'additional', { extra: 'data' })
        expect(v.get('stacker')?.entries).toStrictEqual([
          {
            fileLine: expect.any(Number) as number,
            fileName: __filename,
            funcName: null,
            message: 'Test error message',
            payload: [{ error }, 'additional', { extra: 'data' }],
            severity: 'ERROR',
            time: v.get('timer')?.currentTime
          }
        ])
      })
    })

    describe('Non-Error object as first argument', () => {
      it('should convert to string and use as message', () => {
        const notAnError = { message: 'fake error' }
        v.get('logger')?.error(notAnError)
        expect(v.get('stacker')?.entries).toStrictEqual([
          {
            fileLine: expect.any(Number) as number,
            fileName: __filename,
            funcName: null,
            message: '[object Object]',
            payload: [],
            severity: 'ERROR',
            time: v.get('timer')?.currentTime
          }
        ])
      })
    })
  })

  describe('.critical with Error object', () => {
    describe('Error instance as first argument', () => {
      it('should use error.message as message and {error} as payload', () => {
        const error = new Error('Critical error message')
        error.cause = 'Critical cause'
        v.get('logger')?.critical(error)
        expect(v.get('stacker')?.entries).toStrictEqual([
          {
            fileLine: expect.any(Number) as number,
            fileName: __filename,
            funcName: null,
            message: 'Critical error message',
            payload: { error },
            severity: 'CRITICAL',
            time: v.get('timer')?.currentTime
          }
        ])
      })
    })

    describe('Error with additional arguments', () => {
      it('should include additional arguments in payload', () => {
        const error = new Error('Critical error message')
        v.get('logger')?.critical(error, 'context', { level: 'high' })
        expect(v.get('stacker')?.entries).toStrictEqual([
          {
            fileLine: expect.any(Number) as number,
            fileName: __filename,
            funcName: null,
            message: 'Critical error message',
            payload: [{ error }, 'context', { level: 'high' }],
            severity: 'CRITICAL',
            time: v.get('timer')?.currentTime
          }
        ])
      })
    })

    describe('Non-Error object as first argument', () => {
      it('should convert to string and use as message', () => {
        const notAnError = { level: 'critical' }
        v.get('logger')?.critical(notAnError)
        expect(v.get('stacker')?.entries).toStrictEqual([
          {
            fileLine: expect.any(Number) as number,
            fileName: __filename,
            funcName: null,
            message: '[object Object]',
            payload: [],
            severity: 'CRITICAL',
            time: v.get('timer')?.currentTime
          }
        ])
      })
    })
  })

  describe('.record', () => {
    describe('message only', () => {
      it('should be stack record', () => {
        v.get('logger')?.record('DEBUG', 'hello')
        expect(v.get('stacker')?.entries).toStrictEqual([
          {
            fileLine: 317,
            fileName: __filename,
            funcName: null,
            message: 'hello',
            payload: [],
            severity: 'DEBUG',
            time: v.get('timer')?.currentTime
          }
        ])
      })
    })
  })
})
