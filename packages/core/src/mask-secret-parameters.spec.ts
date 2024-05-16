import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest'
import { LoggerRecord } from './interface'
import { maskPayloadSecretParameters } from './mask-secret-parameters'
import set from 'just-safe-set'

function clone<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T = any
>(object: T) {
  return JSON.parse(JSON.stringify(object)) as T
}

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
        message: 'example',
        payload: {
          username: 'example@logone.com',
          password: '1234abcABC!#@',
          passwordConfirm: '1234abcABC!#@',
          newPassword: '1234abcABC!#@',
          nestedObject: {
            username: 'example@example.com',
            password: '1234abcABC!#@',
            passwordConfirm: '1234abcABC!#@',
            newPassword: '1234abcABC!#@'
          },
          arrayValue: [
            {
              username: 'example@example.com',
              password: '1234abcABC!#@',
              passwordConfirm: '1234abcABC!#@',
              newPassword: '1234abcABC!#@'
            }
          ]
        },
        time: new Date(),
        fileLine: null,
        fileName: null
      }
    ]
  },
  config: {
    elapsedUnit: '1ms',
    maskKeywords: []
  }
}

describe('maskSecretParameters', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.clearAllTimers()
  })
  describe('keyword is empty array []', () => {
    it('should be equal source', () => {
      const expected = clone(record)
      expect(maskPayloadSecretParameters(clone(record), [])).toStrictEqual(
        expected
      )
    })
  })
  describe('keyword is ["password"]', () => {
    it('should be replace *', () => {
      const expected = clone(record)
      set(expected, 'runtime.lines.0.payload.password', '*************')
      set(
        expected,
        'runtime.lines.0.payload.nestedObject.password',
        '*************'
      )
      set(
        expected,
        'runtime.lines.0.payload.arrayValue.0.password',
        '*************'
      )

      expect(
        maskPayloadSecretParameters(clone(record), ['password'])
      ).toStrictEqual(expected)
    })
  })
  describe('keyword is [/password/]', () => {
    it('should be replace *', () => {
      const expected = clone(record)
      set(expected, 'runtime.lines.0.payload.password', '*************')
      set(expected, 'runtime.lines.0.payload.passwordConfirm', '*************')
      set(
        expected,
        'runtime.lines.0.payload.nestedObject.password',
        '*************'
      )
      set(
        expected,
        'runtime.lines.0.payload.nestedObject.passwordConfirm',
        '*************'
      )
      set(
        expected,
        'runtime.lines.0.payload.arrayValue.0.password',
        '*************'
      )
      set(
        expected,
        'runtime.lines.0.payload.arrayValue.0.password',
        '*************'
      )
      set(
        expected,
        'runtime.lines.0.payload.arrayValue.0.passwordConfirm',
        '*************'
      )

      expect(
        maskPayloadSecretParameters(clone(record), [/password/])
      ).toStrictEqual(expected)
    })
  })
  describe('keyword is [/password/, /Password/]', () => {
    it('should be replace *', () => {
      const expected = clone(record)
      set(expected, 'runtime.lines.0.payload.password', '*************')
      set(expected, 'runtime.lines.0.payload.passwordConfirm', '*************')
      set(expected, 'runtime.lines.0.payload.newPassword', '*************')
      set(
        expected,
        'runtime.lines.0.payload.nestedObject.password',
        '*************'
      )
      set(
        expected,
        'runtime.lines.0.payload.nestedObject.passwordConfirm',
        '*************'
      )
      set(
        expected,
        'runtime.lines.0.payload.nestedObject.newPassword',
        '*************'
      )
      set(
        expected,
        'runtime.lines.0.payload.arrayValue.0.password',
        '*************'
      )
      set(
        expected,
        'runtime.lines.0.payload.arrayValue.0.passwordConfirm',
        '*************'
      )
      set(
        expected,
        'runtime.lines.0.payload.arrayValue.0.newPassword',
        '*************'
      )

      expect(
        maskPayloadSecretParameters(clone(record), [/password/, /Password/])
      ).toStrictEqual(expected)
    })
  })
})
