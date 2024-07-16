import { fakeTimer, vars } from '@logone/test-helper'
import { beforeEach, afterEach, describe, expect, it } from 'vitest'
import { LoggerAdapter, LoggerRecord } from './interface'
import { Logone } from './logone'

class FakeAdapter implements LoggerAdapter {
  public outputs: LoggerRecord[] = []

  output(record: LoggerRecord) {
    this.outputs.push(record)
  }
}

const v = vars<{
  logone: Logone
  adapter: FakeAdapter
}>()
const timer = fakeTimer()

describe('Logone', () => {
  beforeEach(() => {
    timer.setup()
  })
  afterEach(() => {
    v.clear()
    timer.clear()
  })

  describe('basic usage', () => {
    beforeEach(() => {
      const adapter = new FakeAdapter()
      v.set('adapter', adapter)
      v.set('logone', new Logone(adapter))

      const { logger, finish } = v.get('logone')!.start('test', {
        case: 'basic usage'
      })

      timer.after(1000)
      logger.info('example 1')

      timer.after(1000)
      logger.debug('example 2')

      timer.after(1000)
      logger.error('example 3')

      timer.after(1000)
      finish()
    })
    it('should be output records', () => {
      expect(v.get('adapter')?.outputs[0]).toStrictEqual({
        type: 'test',
        config: {
          elapsedUnit: '1ms',
          logLevel: 'DEBUG',
          maskKeywords: []
        },
        context: {
          case: 'basic usage'
        },
        runtime: {
          elapsed: 4000,
          endTime: timer.current,
          lines: [
            {
              fileLine: 40,
              fileName: __filename,
              message: 'example 1',
              payload: [],
              severity: 'INFO',
              time: timer.fromStartingTimeAt(1000)
            },
            {
              fileLine: 43,
              fileName: __filename,
              message: 'example 2',
              payload: [],
              severity: 'DEBUG',
              time: timer.fromStartingTimeAt(2000)
            },
            {
              fileLine: 46,
              fileName: __filename,
              message: 'example 3',
              payload: [],
              severity: 'ERROR',
              time: timer.fromStartingTimeAt(3000)
            }
          ],
          severity: 'ERROR',
          startTime: timer.fromStartingTimeAt(0)
        }
      })
    })
  })

  describe('use maskKeywords option', () => {
    beforeEach(() => {
      const adapter = new FakeAdapter()
      v.set('adapter', adapter)
      v.set(
        'logone',
        new Logone(adapter, {
          maskKeywords: ['password']
        })
      )

      const { logger, finish } = v.get('logone')!.start('test', {
        case: 'basic usage'
      })

      timer.after(1000)
      logger.info('example 1', {
        username: 'example',
        password: 'example'
      })

      timer.after(1000)
      logger.debug('example 2')

      timer.after(1000)
      logger.error('example 3')

      timer.after(1000)
      finish()
    })
    it('should be output records', () => {
      expect(v.get('adapter')?.outputs[0]).toStrictEqual({
        type: 'test',
        config: {
          elapsedUnit: '1ms',
          logLevel: 'DEBUG',
          maskKeywords: ['password']
        },
        context: {
          case: 'basic usage'
        },
        runtime: {
          elapsed: 4000,
          endTime: timer.current,
          lines: [
            {
              fileLine: 114,
              fileName: __filename,
              message: 'example 1',
              payload: { username: 'example', password: '*******' },
              severity: 'INFO',
              time: timer.fromStartingTimeAt(1000)
            },
            {
              fileLine: 120,
              fileName: __filename,
              message: 'example 2',
              payload: [],
              severity: 'DEBUG',
              time: timer.fromStartingTimeAt(2000)
            },
            {
              fileLine: 123,
              fileName: __filename,
              message: 'example 3',
              payload: [],
              severity: 'ERROR',
              time: timer.fromStartingTimeAt(3000)
            }
          ],
          severity: 'ERROR',
          startTime: timer.fromStartingTimeAt(0)
        }
      })
    })
  })

  describe('use logLevel option', () => {
    beforeEach(() => {
      const adapter = new FakeAdapter()
      v.set('adapter', adapter)
      v.set(
        'logone',
        new Logone(adapter, {
          logLevel: 'INFO'
        })
      )

      const { logger, finish } = v.get('logone')!.start('test', {
        case: 'use logLevel option'
      })

      timer.after(1000)
      logger.info('example 1', {})

      timer.after(1000)
      logger.debug('example 2', {})

      timer.after(1000)
      logger.critical('example 3', {})

      finish()
    })
    it('should be output over INFO entries', () => {
      console.log(v.get('adapter')?.outputs)
      expect(v.get('adapter')?.outputs[0]?.runtime.lines).length(2)
    })
  })
})
