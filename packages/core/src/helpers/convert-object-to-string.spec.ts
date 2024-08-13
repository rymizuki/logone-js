import { afterEach, beforeEach } from 'node:test'
import { describe, expect, it, vi } from 'vitest'
import { LogRecord } from '../interface'
import { convertObjectToString } from './convert-object-to-string'

const entries: LogRecord[] = [
  {
    severity: 'INFO',
    message: 'example',
    payload: {
      bigint1: BigInt(9007199254740991),
      bigint2: {
        bigint1: BigInt(9007199254740991),
        bigint2: {
          bigint: BigInt(9007199254740991)
        }
      },
      bigint3: [
        {
          bigint: BigInt(9007199254740991)
        },
        BigInt(9007199254740991)
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
            bigint2: {
              bigint1: BigInt(9007199254740991).toString(),
              bigint2: {
                bigint: BigInt(9007199254740991).toString()
              }
            },
            bigint3: [
              {
                bigint: BigInt(9007199254740991).toString()
              },
              BigInt(9007199254740991).toString()
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
