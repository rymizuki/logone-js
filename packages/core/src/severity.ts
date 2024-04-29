import { LoggerSeverity } from './interface'

export const severities: Record<LoggerSeverity, number> = {
  CRITICAL: 5,
  ERROR: 4,
  WARNING: 3,
  INFO: 2,
  DEBUG: 1
}
