import { fakeTimer } from '@logone/test-helper'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  MockInstance,
  vi
} from 'vitest'
import { createAdapter } from './node-adapter'
import { LoggerRecord } from '@logone/core'

const timer = fakeTimer()

describe('node-adapter', () => {
  beforeEach(() => {
    timer.setup()
  })
  afterEach(() => {
    timer.clear()
  })
  describe('debug', () => {
    it('should be output stdout', () => {
      const adapter = createAdapter()
      const spy = vi
        .spyOn(process.stdout, 'write')
        .mockImplementation(() => true)
      adapter.output({
        type: 'test',
        config: {
          elapsedUnit: '1ms'
        },
        context: {},
        runtime: {
          severity: 'DEBUG',
          startTime: new Date(),
          endTime: new Date(),
          elapsed: 0,
          lines: [
            {
              fileLine: 0,
              fileName: 'example.ts',
              message: 'example',
              payload: [],
              severity: 'DEBUG',
              time: new Date()
            }
          ]
        }
      })
      expect(spy).toHaveBeenCalled()
      expect(spy.mock.calls[0]![0]).toEqual(
        `{"type":"test","config":{"elapsedUnit":"1ms"},"context":{},"runtime":{"severity":"DEBUG","startTime":"${timer.current.toISOString()}","endTime":"${timer.current.toISOString()}","elapsed":0,"lines":[{"fileLine":0,"fileName":"example.ts","message":"example","payload":[],"severity":"DEBUG","time":"${timer.current.toISOString()}"}]}}\n`
      )
    })
  })
  describe('info', () => {
    it('should be output stdout', () => {
      const adapter = createAdapter()
      const spy = vi
        .spyOn(process.stdout, 'write')
        .mockImplementation(() => true)
      adapter.output({
        type: 'test',
        config: {
          elapsedUnit: '1ms'
        },
        context: {},
        runtime: {
          severity: 'INFO',
          startTime: new Date(),
          endTime: new Date(),
          elapsed: 0,
          lines: [
            {
              fileLine: 0,
              fileName: 'example.ts',
              message: 'example',
              payload: [],
              severity: 'INFO',
              time: new Date()
            }
          ]
        }
      })
      expect(spy).toHaveBeenCalled()
      expect(spy.mock.calls[0]![0]).toEqual(
        `{"type":"test","config":{"elapsedUnit":"1ms"},"context":{},"runtime":{"severity":"INFO","startTime":"${timer.current.toISOString()}","endTime":"${timer.current.toISOString()}","elapsed":0,"lines":[{"fileLine":0,"fileName":"example.ts","message":"example","payload":[],"severity":"INFO","time":"${timer.current.toISOString()}"}]}}\n`
      )
    })
  })
  describe('warning', () => {
    it('should be output stderr', () => {
      const adapter = createAdapter()
      const spy = vi
        .spyOn(process.stderr, 'write')
        .mockImplementation(() => true)
      adapter.output({
        type: 'test',
        config: {
          elapsedUnit: '1ms'
        },
        context: {},
        runtime: {
          severity: 'WARNING',
          startTime: new Date(),
          endTime: new Date(),
          elapsed: 0,
          lines: [
            {
              fileLine: 0,
              fileName: 'example.ts',
              message: 'example',
              payload: [],
              severity: 'WARNING',
              time: new Date()
            }
          ]
        }
      })
      expect(spy).toHaveBeenCalled()
      expect(spy.mock.calls[0]![0]).toEqual(
        `{"type":"test","config":{"elapsedUnit":"1ms"},"context":{},"runtime":{"severity":"WARNING","startTime":"${timer.current.toISOString()}","endTime":"${timer.current.toISOString()}","elapsed":0,"lines":[{"fileLine":0,"fileName":"example.ts","message":"example","payload":[],"severity":"WARNING","time":"${timer.current.toISOString()}"}]}}\n`
      )
    })
  })
  describe('error', () => {
    it('should be output stderr', () => {
      const adapter = createAdapter()
      const spy = vi
        .spyOn(process.stderr, 'write')
        .mockImplementation(() => true)
      adapter.output({
        type: 'test',
        config: {
          elapsedUnit: '1ms'
        },
        context: {},
        runtime: {
          severity: 'ERROR',
          startTime: new Date(),
          endTime: new Date(),
          elapsed: 0,
          lines: [
            {
              fileLine: 0,
              fileName: 'example.ts',
              message: 'example',
              payload: [],
              severity: 'ERROR',
              time: new Date()
            }
          ]
        }
      })
      expect(spy).toHaveBeenCalled()
      expect(spy.mock.calls[0]![0]).toEqual(
        `{"type":"test","config":{"elapsedUnit":"1ms"},"context":{},"runtime":{"severity":"ERROR","startTime":"${timer.current.toISOString()}","endTime":"${timer.current.toISOString()}","elapsed":0,"lines":[{"fileLine":0,"fileName":"example.ts","message":"example","payload":[],"severity":"ERROR","time":"${timer.current.toISOString()}"}]}}\n`
      )
    })
  })
  describe('critical', () => {
    it('should be output stderr', () => {
      const adapter = createAdapter()
      const spy = vi
        .spyOn(process.stderr, 'write')
        .mockImplementation(() => true)
      adapter.output({
        type: 'test',
        config: {
          elapsedUnit: '1ms'
        },
        context: {},
        runtime: {
          severity: 'CRITICAL',
          startTime: new Date(),
          endTime: new Date(),
          elapsed: 0,
          lines: [
            {
              fileLine: 0,
              fileName: 'example.ts',
              message: 'example',
              payload: [],
              severity: 'CRITICAL',
              time: new Date()
            }
          ]
        }
      })
      expect(spy).toHaveBeenCalled()
      expect(spy.mock.calls[0]![0]).toEqual(
        `{"type":"test","config":{"elapsedUnit":"1ms"},"context":{},"runtime":{"severity":"CRITICAL","startTime":"${timer.current.toISOString()}","endTime":"${timer.current.toISOString()}","elapsed":0,"lines":[{"fileLine":0,"fileName":"example.ts","message":"example","payload":[],"severity":"CRITICAL","time":"${timer.current.toISOString()}"}]}}\n`
      )
    })
  })

  describe('options.contentLengthLimit enable', () => {
    let spy: MockInstance
    beforeEach(() => {
      spy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    })

    let record: LoggerRecord
    beforeEach(() => {
      record = {
        type: 'test',
        config: {
          elapsedUnit: '1ms' as const
        },
        context: {},
        runtime: {
          severity: 'INFO' as const,
          startTime: new Date(),
          endTime: new Date(),
          elapsed: 0,
          lines: [
            {
              fileLine: 0,
              fileName: 'example.ts',
              message: 'example',
              payload: [],
              severity: 'INFO' as const,
              time: new Date()
            },
            {
              fileLine: 0,
              fileName: 'example.ts',
              message: 'example',
              payload: [],
              severity: 'INFO' as const,
              time: new Date()
            },
            {
              fileLine: 0,
              fileName: 'example.ts',
              message: 'example',
              payload: [],
              severity: 'INFO' as const,
              time: new Date()
            }
          ]
        }
      }
    })

    describe('less than limit', () => {
      it('should be output one time', () => {
        const adapter = createAdapter({
          contentLengthLimit: 560 + 1
        })
        adapter.output(record)
        expect(spy).toHaveBeenCalledOnce()
        expect(spy.mock.calls[0]?.[0]).toHaveLength(560)
      })
    })
    describe('equal than limit', () => {
      it('should be output 2 times', () => {
        const adapter = createAdapter({
          contentLengthLimit: 560
        })
        adapter.output(record)
        expect(spy).toHaveBeenCalledTimes(2)
        expect(spy.mock.calls[0]?.[0]).toHaveLength(451)
        expect(spy.mock.calls[1]?.[0]).toHaveLength(327)
      })
    })
    describe('grater than limit onetime', () => {
      it('should be output 2 times', () => {
        const adapter = createAdapter({
          contentLengthLimit: 451 + 1
        })
        adapter.output(record)
        expect(spy).toHaveBeenCalledTimes(2)
        expect(spy.mock.calls[0]?.[0]).toHaveLength(451)
        expect(spy.mock.calls[1]?.[0]).toHaveLength(327)
      })
    })
    describe('grater than limit x2', () => {
      it('should be output 2 times', () => {
        const adapter = createAdapter({
          contentLengthLimit: 327 + 1
        })
        adapter.output(record)
        expect(spy).toHaveBeenCalledTimes(3)
        expect(spy.mock.calls[0]?.[0]).toHaveLength(327)
        expect(spy.mock.calls[1]?.[0]).toHaveLength(327)
        expect(spy.mock.calls[2]?.[0]).toHaveLength(327)
      })
    })
  })
})
