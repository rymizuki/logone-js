import { fakeTimer } from '@logone/test-helper'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createAdapter } from './node-adapter'

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
})
