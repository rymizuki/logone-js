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
            fileLine: 48,
            fileName: __filename,
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
            fileLine: 65,
            fileName: __filename,
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
            fileLine: 80,
            fileName: __filename,
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
            fileLine: 97,
            fileName: __filename,
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
            fileLine: 112,
            fileName: __filename,
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
            fileLine: 129,
            fileName: __filename,
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
            fileLine: 144,
            fileName: __filename,
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
            fileLine: 161,
            fileName: __filename,
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
            fileLine: 176,
            fileName: __filename,
            message: 'hello',
            payload: [1, { message: 'hello' }],
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
            fileLine: 193,
            fileName: __filename,
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
