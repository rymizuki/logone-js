/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { LogRecord } from '../interface'

export const convertObjectToString = (entries: LogRecord[]) => {
  return entries.map((entry) => ({
    ...entry,
    payload: createProcessor()(entry.payload)
  }))
}

const replacer = {
  bigint: {
    check: (value: unknown) => typeof value === 'bigint',
    replace: (value: bigint) => value.toString()
  },
  date: {
    check: (value: unknown) => value instanceof Date,
    replace: (value: Date) => value.toISOString()
  },
  error: {
    check: (value: unknown) => value instanceof Error,
    replace: (value: Error) => ({
      name: value.name,
      message: value.message,
      cause: value.cause,
      stack: value.stack
    })
  },
  jsonify: {
    check: (value: unknown) =>
      value && typeof value == 'object' && 'toJSON' in value,
    replace: (value: { toJSON: () => string }) => value.toJSON()
  }
} as const

function createProcessor() {
  const recursive: (payload: unknown) => unknown = (payload) => {
    if (!payload) return payload
    for (const type of Object.keys(replacer) as (keyof typeof replacer)[]) {
      if (!Object.prototype.hasOwnProperty.call(replacer, type)) {
        continue
      }
      const { check, replace } = replacer[type]
      if (check(payload)) {
        return replace(payload as any)
      }
    }
    if (typeof payload !== 'object') return payload
    if (Array.isArray(payload)) {
      return payload.map((row) => recursive(row))
    }
    return Object.keys(payload).reduce((prev, prop) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const value = payload[prop]
      prev[prop] = recursive(value)
      return prev
    }, {} as any)
  }
  return recursive
}
