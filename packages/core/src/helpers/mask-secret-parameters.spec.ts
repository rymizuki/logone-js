import set from 'just-safe-set'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LogRecord } from '../interface'
import { maskPayloadSecretParameters } from './mask-secret-parameters'

function clone<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T = any
>(object: T) {
  return JSON.parse(JSON.stringify(object)) as T
}

const entries: LogRecord[] = [
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

describe('maskSecretParameters', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.clearAllTimers()
  })
  describe('keyword is empty array []', () => {
    it('should be equal source', () => {
      const expected = clone(entries)
      expect(maskPayloadSecretParameters(clone(entries), [])).toStrictEqual(
        expected
      )
    })
  })
  describe('keyword is ["password"]', () => {
    it('should be replace *', () => {
      const expected = clone(entries)
      set(expected, '0.payload.password', '*************')
      set(expected, '0.payload.nestedObject.password', '*************')
      set(expected, '0.payload.arrayValue.0.password', '*************')

      expect(
        maskPayloadSecretParameters(clone(entries), ['password'])
      ).toStrictEqual(expected)
    })
  })
  describe('keyword is [/password/]', () => {
    it('should be replace *', () => {
      const expected = clone(entries)
      set(expected, '0.payload.password', '*************')
      set(expected, '0.payload.passwordConfirm', '*************')
      set(expected, '0.payload.nestedObject.password', '*************')
      set(expected, '0.payload.nestedObject.passwordConfirm', '*************')
      set(expected, '0.payload.arrayValue.0.password', '*************')
      set(expected, '0.payload.arrayValue.0.password', '*************')
      set(expected, '0.payload.arrayValue.0.passwordConfirm', '*************')

      expect(
        maskPayloadSecretParameters(clone(entries), [/password/])
      ).toStrictEqual(expected)
    })
  })
  describe('keyword is [/password/, /Password/]', () => {
    it('should be replace *', () => {
      const expected = clone(entries)
      set(expected, '0.payload.password', '*************')
      set(expected, '0.payload.passwordConfirm', '*************')
      set(expected, '0.payload.newPassword', '*************')
      set(expected, '0.payload.nestedObject.password', '*************')
      set(expected, '0.payload.nestedObject.passwordConfirm', '*************')
      set(expected, '0.payload.nestedObject.newPassword', '*************')
      set(expected, '0.payload.arrayValue.0.password', '*************')
      set(expected, '0.payload.arrayValue.0.passwordConfirm', '*************')
      set(expected, '0.payload.arrayValue.0.newPassword', '*************')

      expect(
        maskPayloadSecretParameters(clone(entries), [/password/, /Password/])
      ).toStrictEqual(expected)
    })
  })
})
