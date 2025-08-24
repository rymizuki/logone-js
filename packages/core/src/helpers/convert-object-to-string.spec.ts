import { afterEach, beforeEach } from 'node:test'
import { describe, expect, it, vi } from 'vitest'
import { LogRecord } from '../interface'
import { convertObjectToString } from './convert-object-to-string'

class JsonifyMock {
  toJSON() {
    return 'jsonify mock'
  }
}

const now = new Date('2024/01/01 00:00:00')
const entries: LogRecord[] = [
  {
    severity: 'INFO',
    message: 'example',
    payload: {
      bigint1: BigInt(9007199254740991),
      date: now,
      jsonify: new JsonifyMock(),
      bigint2: {
        bigint1: BigInt(9007199254740991),
        date: now,
        jsonify: new JsonifyMock(),
        bigint2: {
          bigint: BigInt(9007199254740991),
          date: now,
          jsonify: new JsonifyMock()
        }
      },
      bigint3: [
        {
          bigint: BigInt(9007199254740991),
          date: now,
          jsonify: new JsonifyMock(),
          rows: [
            {
              bigint: BigInt(9007199254740991),
              date: now,
              jsonify: new JsonifyMock()
            },
            BigInt(9007199254740991),
            now,
            new JsonifyMock()
          ]
        },
        BigInt(9007199254740991),
        now,
        new JsonifyMock()
      ]
    },
    time: new Date(),
    fileLine: null,
    fileName: null
  }
]

describe('exclude recursive reference', () => {
  describe('on recursive payload', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(now)
    })
    afterEach(() => {
      vi.clearAllTimers()
    })
    it('remove duplicate value', () => {
      expect(convertObjectToString(entries)).toStrictEqual([
        {
          severity: 'INFO',
          message: 'example',
          payload: {
            bigint1: BigInt(9007199254740991).toString(),
            date: now.toISOString(),
            jsonify: 'jsonify mock',
            bigint2: {
              bigint1: BigInt(9007199254740991).toString(),
              date: now.toISOString(),
              jsonify: 'jsonify mock',
              bigint2: {
                bigint: BigInt(9007199254740991).toString(),
                date: now.toISOString(),
                jsonify: 'jsonify mock'
              }
            },
            bigint3: [
              {
                date: now.toISOString(),
                bigint: BigInt(9007199254740991).toString(),
                jsonify: 'jsonify mock',
                rows: [
                  {
                    bigint: BigInt(9007199254740991).toString(),
                    date: now.toISOString(),
                    jsonify: 'jsonify mock'
                  },
                  BigInt(9007199254740991).toString(),
                  now.toISOString(),
                  'jsonify mock'
                ]
              },
              BigInt(9007199254740991).toString(),
              now.toISOString(),
              'jsonify mock'
            ]
          },
          time: entries[0]?.time,
          fileLine: null,
          fileName: null
        }
      ])
    })
  })

  describe('Error object handling', () => {
    it('should properly serialize Error objects', () => {
      const error = new Error('Test error message')
      error.cause = 'Test cause'
      
      const errorEntries: LogRecord[] = [
        {
          severity: 'ERROR',
          message: 'Error test',
          payload: error,
          time: new Date(),
          fileLine: null,
          fileName: null
        }
      ]
      
      const result = convertObjectToString(errorEntries)
      
      expect(result[0].payload).toHaveProperty('name', 'Error')
      expect(result[0].payload).toHaveProperty('message', 'Test error message')
      expect(result[0].payload).toHaveProperty('cause', 'Test cause')
      expect(result[0].payload).toHaveProperty('stack')
    })

    it('should properly serialize nested Error objects', () => {
      const mainError = new Error('Main error')
      const nestedError = new Error('Nested error')
      
      const errorEntries: LogRecord[] = [
        {
          severity: 'ERROR',
          message: 'Nested errors',
          payload: {
            mainError,
            nested: {
              error: nestedError
            }
          },
          time: new Date(),
          fileLine: null,
          fileName: null
        }
      ]
      
      const result = convertObjectToString(errorEntries)
      
      expect(result[0].payload.mainError).toHaveProperty('name', 'Error')
      expect(result[0].payload.mainError).toHaveProperty('message', 'Main error')
      expect(result[0].payload.nested.error).toHaveProperty('name', 'Error')
      expect(result[0].payload.nested.error).toHaveProperty('message', 'Nested error')
    })

    it('should handle Error with nested Error in cause', () => {
      const causeError = new Error('Cause error')
      const mainError = new Error('Main error')
      mainError.cause = causeError
      
      const errorEntries: LogRecord[] = [
        {
          severity: 'ERROR',
          message: 'Error with Error cause',
          payload: mainError,
          time: new Date(),
          fileLine: null,
          fileName: null
        }
      ]
      
      const result = convertObjectToString(errorEntries)
      
      expect(result[0].payload).toHaveProperty('name', 'Error')
      expect(result[0].payload).toHaveProperty('message', 'Main error')
      expect(result[0].payload.cause).toHaveProperty('name', 'Error')
      expect(result[0].payload.cause).toHaveProperty('message', 'Cause error')
    })
  })
})