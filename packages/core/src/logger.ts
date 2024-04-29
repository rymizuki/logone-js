import { LogRecord, LoggerSeverity } from './interface'
import { Stacker } from './stacker'
import { Timer } from './timer'

export class Logger {
  constructor(
    private timer: Timer,
    private stacker: Stacker
  ) {}

  debug(message: string, ...args: unknown[]) {
    this.addEntry('DEBUG', message, ...args)
  }
  info(message: string, ...args: unknown[]) {
    this.addEntry('INFO', message, ...args)
  }
  warning(message: string, ...args: unknown[]) {
    this.addEntry('WARNING', message, ...args)
  }
  error(message: string, ...args: unknown[]) {
    this.addEntry('ERROR', message, ...args)
  }
  critical(message: string, ...args: unknown[]) {
    this.addEntry('CRITICAL', message, ...args)
  }
  record(severity: LoggerSeverity, message: string) {
    this.addEntry(severity, message)
  }

  private addEntry(
    severity: LoggerSeverity,
    message: string,
    ...args: unknown[]
  ) {
    const [fileName, fileLine] = this.getCallerPosition()

    const entry: LogRecord = {
      severity,
      time: this.timer.currentTime,
      message,
      payload: args.length === 1 ? args[0] : args,
      fileLine,
      fileName
    }

    this.stacker.stack(entry)
  }

  private getCallerPosition(): [string | null, number | null, number | null] {
    const stack = new Error().stack
    const rows = stack ? stack.split(/\n/) : []
    const current = rows[4]
    if (!current) {
      return [null, null, null]
    }
    const [file, lines, chars] = current.replace(/\s*at\s+/, '').split(/:/)
    return [
      file ?? null,
      lines ? Number(lines) : null,
      chars ? Number(chars) : null
    ]
  }
}
