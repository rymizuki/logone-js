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

  private getCallerPosition(): [string | null, number | null] {
    const stack = new Error().stack
    if (!stack) {
      return [null, null]
    }
    
    const rows = stack.split(/\n/)
    
    // 適切なコールスタックの行を見つける（通常は3-5行目あたり）
    for (let i = 3; i < Math.min(rows.length, 7); i++) {
      const line = rows[i]
      if (!line) continue
      
      // Node.jsのスタックトレース形式: "    at function (file:line:column)"
      const match = line.match(/\s+at\s+.*?\((.+):(\d+):\d+\)/) || 
                    line.match(/\s+at\s+(.+):(\d+):\d+/)
      
      if (match) {
        const fileName = match[1]
        const lineNumber = parseInt(match[2], 10)
        
        // 内部ファイルをスキップ
        if (fileName.includes('logger.ts') || fileName.includes('node_modules')) {
          continue
        }
        
        return [fileName, lineNumber]
      }
    }
    
    return [null, null]
  }
}
