import { LoggerSeverity, LogRecord } from '../interface'

export const logLevel: Record<LoggerSeverity, number> = {
  DEBUG: 1,
  INFO: 2,
  WARNING: 3,
  ERROR: 4,
  CRITICAL: 5
}

export const filterSeverityByLevel = (
  level: LoggerSeverity,
  entries: LogRecord[]
) => {
  const threshold = logLevel[level]
  return entries.filter((entry) => threshold <= logLevel[entry.severity])
}
