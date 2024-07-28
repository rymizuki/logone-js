import { afterEach, beforeEach } from 'node:test'
import { describe, expect, it, vi } from 'vitest'
import { LogRecord } from '../interface'
import { excludeRecursiveBigInt } from './exclude-recursive-bigint'

const entries: LogRecord[] = [
  {
    severity: 'INFO',
    message: 'example',
    payload: {
      value1: BigInt(9007199254740991),
      value2: {
        value: BigInt(9007199254740991)
      },
      value3: [
        {
          value: BigInt(9007199254740991)
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
      expect(excludeRecursiveBigInt(entries)).toStrictEqual([
        {
          severity: 'INFO',
          message: 'example',
          payload: {
            value1: BigInt(9007199254740991).toString(),
            value2: {
              value: BigInt(9007199254740991).toString()
            },
            value3: [
              {
                value: BigInt(9007199254740991).toString()
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
