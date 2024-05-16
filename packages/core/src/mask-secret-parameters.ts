import { LoggerConfig, LoggerRecord } from './interface'

type KeywordType = NonNullable<LoggerConfig['maskKeywords']>[number]

export function maskPayloadSecretParameters(
  record: LoggerRecord,
  keywords: LoggerConfig['maskKeywords']
) {
  if (!keywords || !keywords.length) {
    return record
  }
  record.runtime.lines = record.runtime.lines.map((entry) => ({
    ...entry,
    payload: maskRecursive(entry.payload, keywords)
  }))
  return record
}

function maskRecursive(payload: unknown, keywords: KeywordType[]): unknown {
  if (!payload) return payload
  if (typeof payload !== 'object') return payload
  if (Array.isArray(payload)) {
    return payload.map((record) => maskRecursive(record, keywords))
  }

  return Object.keys(payload).reduce(
    (prev, prop) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const value = (payload as any)[prop]
      prev[prop] =
        typeof value === 'object'
          ? maskRecursive(value, keywords)
          : isMatchKeyword(prop, keywords)
            ? execMask(value)
            : value
      return prev
    },
    {} as Record<string, unknown>
  )
}

function isMatchKeyword(prop: string, keywords: KeywordType[]) {
  for (const keyword of keywords) {
    if (typeof keyword === 'string') {
      if (prop === keyword) return true
    }
    if (keyword instanceof RegExp) {
      if (keyword.test(prop)) return true
    }
  }
  return false
}

function execMask(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
) {
  return `${value}`.replace(/./g, '*')
}
