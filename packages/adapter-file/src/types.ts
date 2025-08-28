// @logone/core の型定義（テスト用）
export type LoggerSeverity = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'

export interface LoggerContext {}

export interface LoggerConfigTimer {
  elapsedUnit: '1ms'
}

export interface LoggerConfigLogone {
  maskKeywords: (string | RegExp)[]
  logLevel: LoggerSeverity
}

export type LoggerConfig = LoggerConfigTimer & LoggerConfigLogone

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
  config: Partial<LoggerConfig>
}

type LogRecordBase = {
  severity: LoggerSeverity
  message: string
  payload: unknown
  time: Date
  fileLine: number | null
  fileName: string | null
  funcName: string | null
  tags?: string[]
  attributes?: string
}
type LogRecordError = LogRecordBase & {
  error: string
  stackTrace: string[]
}
export type LogRecord = LogRecordBase | LogRecordError

export interface LoggerAdapter {
  output(record: LoggerRecord): void
}