import { LogRecord, LoggerConfig } from '../interface'

type KeywordType = NonNullable<LoggerConfig['maskKeywords']>[number]

export function maskPayloadSecretParameters(
  entries: LogRecord[],
  keywords: LoggerConfig['maskKeywords']
) {
  if (!keywords || !keywords.length) {
    return entries
  }
  return entries.map((entry) => ({
    ...entry,
    payload: maskRecursive(entry.payload, keywords)
  }))
}

function maskRecursive(payload: unknown, keywords: KeywordType[]): unknown {
  if (!payload) return payload
  if (typeof payload === 'string')
    return replaceAsterByMatchCapture(payload, keywords)
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
            ? `${value}`.replace(/./g, '*')
            : replaceAsterByMatchCapture(value, keywords)
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

function replaceAsterByMatchCapture(value: unknown, keywords: KeywordType[]) {
  if (typeof value !== 'string') return value
  for (const keyword of keywords) {
    if (!(keyword instanceof RegExp)) {
      continue
    }

    const found = value.match(keyword)
    if (!found) {
      continue
    }

    const [, capture] = found
    if (!capture) {
      continue
    }

    return value.replace(capture, capture.replace(/./g, '*'))
  }
  return value
}
