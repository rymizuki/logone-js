/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { LogRecord } from '../interface'

export const excludeRecursiveReference = (entries: LogRecord[]) => {
  return entries.map((entry) => ({
    ...entry,
    payload: createExcludeRecursive()(entry.payload)
  }))
}

function createExcludeRecursive() {
  const seen = new WeakSet()
  const excludeRecursive: (payload: unknown) => unknown = (
    payload: unknown
  ) => {
    if (!payload) return payload
    if (typeof payload !== 'object') return payload
    if (seen.has(payload)) return '[Circular]'
    seen.add(payload)
    if (Array.isArray(payload)) {
      return payload.map((row) => excludeRecursive(row))
    }
    if (payload instanceof Date) return payload
    if (typeof payload === 'bigint') return payload
    
    // Check if object has toJSON method that returns self
    if ('toJSON' in payload && typeof payload.toJSON === 'function') {
      try {
        const jsonResult = payload.toJSON()
        if (jsonResult === payload) {
          return '[Circular]'
        }
      } catch (e) {
        // Ignore errors from toJSON
      }
    }
    
    return Object.keys(payload).reduce((prev, prop) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const value = payload[prop]
      prev[prop] = typeof value === 'object' ? excludeRecursive(value) : value
      return prev
    }, {} as any)
  }
  return excludeRecursive
}
