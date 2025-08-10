import { afterEach, beforeEach } from 'node:test'
import { describe, expect, it, vi } from 'vitest'
import { LogRecord } from '../interface'
import { excludeRecursiveReference } from './exclude-recursive-reference'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const recursive: any = {
  name: 'recursiveObject',
  payload: {}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const children: any = {
  name: 'children',
  payload: {
    // eslint-disable-next-line
    // @ts-ignore
    recursive // eslint-disable-line @typescript-eslint/no-unsafe-assignment
  }
}

// eslint-disable-next-line
recursive.payload['children'] = children

const entries: LogRecord[] = [
  {
    severity: 'INFO',
    message: 'example',
    payload: {
      recursive // eslint-disable-line @typescript-eslint/no-unsafe-assignment
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
      expect(excludeRecursiveReference(entries)).toStrictEqual([
        {
          severity: 'INFO',
          message: 'example',
          payload: {
            recursive: {
              name: 'recursiveObject',
              payload: {
                children: {
                  name: 'children',
                  payload: {
                    recursive: '[Circular]'
                  }
                }
              }
            }
          },
          time: entries[0]?.time,
          fileLine: null,
          fileName: null
        }
      ])
    })
  })

  describe('on bigint values', () => {
    it('should preserve bigint values', () => {
      const entriesWithBigInt: LogRecord[] = [
        {
          severity: 'INFO',
          message: 'bigint test',
          payload: {
            bigintValue: BigInt(9007199254740991),
            nested: {
              anotherBigInt: BigInt(-123456789012345)
            },
            array: [BigInt(42), BigInt(0)]
          },
          time: new Date(),
          fileLine: null,
          fileName: null
        }
      ]

      const result = excludeRecursiveReference(entriesWithBigInt)
      expect(result[0]?.payload).toStrictEqual({
        bigintValue: BigInt(9007199254740991),
        nested: {
          anotherBigInt: BigInt(-123456789012345)
        },
        array: [BigInt(42), BigInt(0)]
      })
    })
  })
})
