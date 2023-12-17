import { afterEach, describe, expect, it, vi } from 'vitest'
import { createProvider } from './node'
import { LoggerRecord } from '../'

describe('logone/providers/NodeProvider', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })
  describe('severity: CRITICAL', () => {
    it('should be write to stderr', () => {
      const spy = vi.spyOn(process.stderr, 'write')
      const record: LoggerRecord = {
        type: 'test',
        context: {},
        runtime: {
          severity: 'CRITICAL',
          startTime: new Date(),
          endTime: new Date(),
          elapsed: 0,
          lines: [
            {
              severity: 'CRITICAL',
              message: 'this is test',
              time: new Date(),
              fileName: 'test',
              fileLine: 0,
              error: 'this is test error',
              stackTrace: []
            }
          ]
        },
        config: {}
      }
      createProvider().output(record)
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy.mock.calls).toStrictEqual([[`${JSON.stringify(record)}\n`]])
    })
  })
  describe('severity: ERROR', () => {
    it('should be write to stderr', () => {
      const spy = vi.spyOn(process.stderr, 'write')
      const record: LoggerRecord = {
        type: 'test',
        context: {},
        runtime: {
          severity: 'ERROR',
          startTime: new Date(),
          endTime: new Date(),
          elapsed: 0,
          lines: [
            {
              severity: 'ERROR',
              message: 'this is test',
              time: new Date(),
              fileName: 'test',
              fileLine: 0,
              error: 'this is test error',
              stackTrace: []
            }
          ]
        },
        config: {}
      }
      createProvider().output(record)
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy.mock.calls).toStrictEqual([[`${JSON.stringify(record)}\n`]])
    })
  })
  describe('severity: WARNING', () => {
    it('should be write to stderr', () => {
      const spy = vi.spyOn(process.stderr, 'write')
      const record: LoggerRecord = {
        type: 'test',
        context: {},
        runtime: {
          severity: 'WARNING',
          startTime: new Date(),
          endTime: new Date(),
          elapsed: 0,
          lines: [
            {
              severity: 'WARNING',
              message: 'this is test',
              time: new Date(),
              fileName: 'test',
              fileLine: 0,
              error: 'this is test error',
              stackTrace: []
            }
          ]
        },
        config: {}
      }
      createProvider().output(record)
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy.mock.calls).toStrictEqual([[`${JSON.stringify(record)}\n`]])
    })
  })
  describe('severity: INFO', () => {
    it('should be write to stdout', () => {
      const spy = vi.spyOn(process.stdout, 'write')
      const record: LoggerRecord = {
        type: 'test',
        context: {},
        runtime: {
          severity: 'INFO',
          startTime: new Date(),
          endTime: new Date(),
          elapsed: 0,
          lines: [
            {
              severity: 'INFO',
              message: 'this is test',
              time: new Date(),
              fileName: 'test',
              fileLine: 0,
              error: 'this is test error',
              stackTrace: []
            }
          ]
        },
        config: {}
      }
      createProvider().output(record)
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy.mock.calls).toStrictEqual([[`${JSON.stringify(record)}\n`]])
    })
  })
  describe('severity: DEBUG', () => {
    it('should be write to stdout', () => {
      const spy = vi.spyOn(process.stdout, 'write')
      const record: LoggerRecord = {
        type: 'test',
        context: {},
        runtime: {
          severity: 'DEBUG',
          startTime: new Date(),
          endTime: new Date(),
          elapsed: 0,
          lines: [
            {
              severity: 'DEBUG',
              message: 'this is test',
              time: new Date(),
              fileName: 'test',
              fileLine: 0,
              error: 'this is test error',
              stackTrace: []
            }
          ]
        },
        config: {}
      }
      createProvider().output(record)
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy.mock.calls).toStrictEqual([[`${JSON.stringify(record)}\n`]])
    })
  })
})
