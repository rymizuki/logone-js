/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { vi } from 'vitest'
import { Logone } from './logone'
import {
  LogRecord,
  LoggerAdapter,
  LogoneConfig,
  StreamingAdapter
} from './interface'

describe('Logone Streaming Support', () => {
  describe('subscribe/unsubscribe', () => {
    it('should allow subscribing to log entries', () => {
      const adapter: LoggerAdapter = { output: vi.fn() }
      const logone = new Logone(adapter)

      const entries: LogRecord[] = []
      const unsubscribe = logone.subscribe((entry) => {
        entries.push(entry)
      })

      const { logger, finish } = logone.start('test')
      logger.info('Test message')
      logger.error('Error message')

      expect(entries).toHaveLength(2)
      expect(entries[0].message).toBe('Test message')
      expect(entries[0].severity).toBe('INFO')
      expect(entries[1].message).toBe('Error message')
      expect(entries[1].severity).toBe('ERROR')

      finish()

      unsubscribe()
    })

    it('should support multiple subscribers', () => {
      const adapter: LoggerAdapter = { output: vi.fn() }
      const logone = new Logone(adapter)

      const entries1: LogRecord[] = []
      const entries2: LogRecord[] = []

      const unsubscribe1 = logone.subscribe((entry) => {
        entries1.push(entry)
      })

      const unsubscribe2 = logone.subscribe((entry) => {
        entries2.push(entry)
      })

      const { logger, finish } = logone.start('test')
      logger.info('Test message')

      expect(entries1).toHaveLength(1)
      expect(entries2).toHaveLength(1)
      expect(entries1[0]).toEqual(entries2[0])

      unsubscribe1()
      logger.info('Second message')

      expect(entries1).toHaveLength(1) // Not updated after unsubscribe
      expect(entries2).toHaveLength(2) // Still receiving updates

      finish()
      unsubscribe2()
    })

    it('should handle errors in subscribers gracefully', () => {
      const adapter: LoggerAdapter = { output: vi.fn() }
      const logone = new Logone(adapter)

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation()

      const goodEntries: LogRecord[] = []

      logone.subscribe(() => {
        throw new Error('Subscriber error')
      })

      logone.subscribe((entry) => {
        goodEntries.push(entry)
      })

      const { logger, finish } = logone.start('test')
      logger.info('Test message')

      expect(goodEntries).toHaveLength(1)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error in log entry listener:',
        expect.any(Error)
      )

      finish()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('StreamingAdapter', () => {
    it('should call onEntry for streaming adapters', () => {
      const onEntryMock = vi.fn()
      const streamingAdapter: StreamingAdapter = {
        output: vi.fn(),
        onEntry: onEntryMock
      }

      const config: LogoneConfig = {
        elapsedUnit: '1ms',
        maskKeywords: [],
        logLevel: 'DEBUG'
      }

      const logone = new Logone(streamingAdapter, config)
      const { logger, finish } = logone.start('test')

      logger.info('Test message')
      logger.debug('Debug message')

      expect(onEntryMock).toHaveBeenCalledTimes(2)
      expect(onEntryMock).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'INFO',
          message: 'Test message'
        }),
        config
      )
      expect(onEntryMock).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'DEBUG',
          message: 'Debug message'
        }),
        config
      )

      finish()
    })

    it('should handle errors in StreamingAdapter.onEntry gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation()

      const streamingAdapter: StreamingAdapter = {
        output: vi.fn(),
        onEntry: () => {
          throw new Error('Adapter error')
        }
      }

      const logone = new Logone(streamingAdapter)
      const { logger, finish } = logone.start('test')

      // Should not throw
      expect(() => logger.info('Test message')).not.toThrow()

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error in streaming adapter onEntry:',
        'Adapter error'
      )

      finish()
      consoleErrorSpy.mockRestore()
    })

    it('should work with both subscribers and StreamingAdapter', () => {
      const subscriberEntries: LogRecord[] = []
      const adapterEntries: LogRecord[] = []

      const streamingAdapter: StreamingAdapter = {
        output: vi.fn(),
        onEntry: (entry) => {
          adapterEntries.push(entry)
        }
      }

      const logone = new Logone(streamingAdapter)
      logone.subscribe((entry) => {
        subscriberEntries.push(entry)
      })

      const { logger, finish } = logone.start('test')
      logger.info('Test message')

      expect(subscriberEntries).toHaveLength(1)
      expect(adapterEntries).toHaveLength(1)
      expect(subscriberEntries[0]).toEqual(adapterEntries[0])

      finish()
    })

    it('should support multiple streaming adapters', () => {
      const onEntryMock1 = vi.fn()
      const onEntryMock2 = vi.fn()

      const streamingAdapter1: StreamingAdapter = {
        output: vi.fn(),
        onEntry: onEntryMock1
      }

      const streamingAdapter2: StreamingAdapter = {
        output: vi.fn(),
        onEntry: onEntryMock2
      }

      const logone = new Logone([streamingAdapter1, streamingAdapter2])
      const { logger, finish } = logone.start('test')

      logger.info('Test message')

      expect(onEntryMock1).toHaveBeenCalledTimes(1)
      expect(onEntryMock2).toHaveBeenCalledTimes(1)
      expect(onEntryMock1).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'INFO',
          message: 'Test message'
        }),
        expect.any(Object)
      )
      expect(onEntryMock2).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'INFO',
          message: 'Test message'
        }),
        expect.any(Object)
      )

      finish()
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(streamingAdapter1.output).toHaveBeenCalled()
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(streamingAdapter2.output).toHaveBeenCalled()
    })
  })
})
