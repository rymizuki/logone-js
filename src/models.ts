export type LoggerSeverity = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'

export interface LoggerContext {}

export interface LoggerConfig {}

export type LoggerRecord = {
  type: string
  context: LoggerContext
  runtime: {
    severity: LoggerSeverity
    startTime: Date
    endTime: Date
    elapsed: number
    lines: LogRecord[]
  }
  config: LoggerConfig
}

type LogRecordBase = {
  severity: LoggerSeverity
  message: string
  time: Date
  fileLine: number | null
  fileName: string | null
  tags?: string[]
  attributes?: string
}
type LogRecordError = LogRecordBase & {
  error: string
  stackTrace: string[]
}
type LogRecord = LogRecordBase | LogRecordError
