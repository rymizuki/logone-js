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
})
