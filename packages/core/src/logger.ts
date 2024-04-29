import { Adapter } from './adapter'
import { Provider } from './provider'
import { Timer } from './timer'
import {
  LoggerSeverity,
  LoggerContext,
  LoggerConfig,
  LoggerRecord
} from './models'
import util from 'util'

export interface LoggerInterface {
  start(): void
  finish(): void
  debug(format: string, ...args: unknown[]): void
  info(format: string, ...args: unknown[]): void
  warning(format: string, ...args: unknown[]): void
  error(format: string, ...args: unknown[]): void
  critical(format: string, ...args: unknown[]): void
  record(severity: LoggerSeverity, format: string, ...args: unknown[]): void
}

const SEVERITY_LEVEL = {
  CRITICAL: 5,
  ERROR: 4,
  WARNING: 3,
  INFO: 2,
  DEBUG: 1
}

export class Logger implements LoggerInterface {
  private context: LoggerContext = {}
  private entries: LoggerRecord['runtime']['lines'] = []

  constructor(
    private timer: Timer,
    private adapter: Adapter,
    private provider: Provider,
    private config: LoggerConfig = {}
  ) {}

  start() {
    this.timer.start()
  }

  finish() {
    this.timer.finish()
    if (!this.entries.length) {
      return
    }

    const severity = this.getHighestSeverity()
    const payload = {
      type: this.adapter.type,
      context: this.context,
      runtime: {
        severity,
        startTime: this.timer.startTime,
        endTime: this.timer.endTime,
        elapsed: this.timer.elapsed,
        lines: this.entries
      },
      config: this.config
    }
    this.provider.output(payload)
  }

  setLogContext(context: LoggerContext): void {
    this.context = context
  }

  debug(format: string, ...args: unknown[]): void {
    this.addEntry('DEBUG', format, ...args)
  }

  info(format: string, ...args: unknown[]): void {
    this.addEntry('INFO', format, ...args)
  }

  warning(format: string, ...args: unknown[]): void {
    this.addEntry('WARNING', format, ...args)
  }

  error(format: string, ...args: unknown[]): void {
    console.log()
    this.addEntry('ERROR', format, ...args)
  }

  critical(format: string, ...args: unknown[]): void {
    this.addEntry('CRITICAL', format, ...args)
  }

  record(severity: LoggerSeverity, message: string): void {
    this.addEntry(severity, message)
  }

  private addEntry(
    severity: LoggerSeverity,
    format: string,
    ...args: unknown[]
  ) {
    const [fileName, fileLine] = this.getCallerPosition()

    const entry: LoggerRecord['runtime']['lines'][0] = {
      severity,
      time: this.timer.currentTime,
      message: util.format(format, ...args),
      fileLine,
      fileName
    }
    this.entries.push(entry)
  }

  private getHighestSeverity(): LoggerSeverity {
    const level = this.entries
      .map(({ severity }) => SEVERITY_LEVEL[severity])
      .reduce((prev, level) => (prev < level ? level : prev), 0)
    const severity = (
      Object.keys(SEVERITY_LEVEL) as (keyof typeof SEVERITY_LEVEL)[]
    ).find((severity) => SEVERITY_LEVEL[severity] === level)
    if (!severity) {
      throw new Error('Logger has no entry by based on severity')
    }
    return severity
  }

  private getCallerPosition(): [string | null, number | null, number | null] {
    const stack = new Error().stack
    const rows = stack ? stack.split(/\n/) : []
    const current = rows[4]
    if (!current) {
      return [null, null, null]
    }
    const [file, lines, chars] = current.replace(/\s*at\s+/, '').split(/:/)
    return [file, lines ? Number(lines) : null, chars ? Number(chars) : null]
  }
}
