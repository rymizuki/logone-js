/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { LogRecord } from '../interface'

export const excludeRecursiveBigInt = (entries: LogRecord[]) => {
  return entries.map((entry) => ({
    ...entry,
    payload: createProcessor()(entry.payload)
  }))
}

function createProcessor() {
  const convert = (value: bigint) => {
    return value.toString()
  }
  const recursive: (payload: unknown) => unknown = (payload) => {
    if (!payload) return payload
    if (typeof payload === 'bigint') return convert(payload)
    if (typeof payload !== 'object') return payload
    if (Array.isArray(payload)) {
      return payload.map((row) => recursive(row))
    }
    return Object.keys(payload).reduce((prev, prop) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const value = payload[prop]
      prev[prop] =
        typeof value === 'bigint'
          ? convert(value)
          : typeof value === 'object'
            ? recursive(value)
            : value
      return prev
    }, {} as any)
  }
  return recursive
}
