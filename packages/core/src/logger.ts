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
    const [fileName, fileLine, funcName] = this.getCallerPosition()

    const entry: LogRecord = {
      severity,
      time: this.timer.currentTime,
      message,
      payload: args.length === 1 ? args[0] : args,
      fileLine,
      fileName,
      funcName
    }

    this.stacker.stack(entry)
  }

  private getCallerPosition(): [string | null, number | null, string | null] {
    const stack = new Error().stack
    if (!stack) {
      return [null, null, null]
    }
    
    const rows = stack.split(/\n/)
    
    // Find appropriate call stack line (usually around lines 3-5)
    for (let i = 3; i < Math.min(rows.length, 7); i++) {
      const line = rows[i]
      if (!line) continue
      
      // Parse Node.js stack trace formats
      // 1. "    at functionName (file:line:column)" format
      const funcMatch = line.match(/\s+at\s+([^(]+)\s*\((.+):(\d+):\d+\)/)
      if (funcMatch && funcMatch[1] && funcMatch[2] && funcMatch[3]) {
        const funcName = funcMatch[1].trim()
        const fileName = funcMatch[2]
        const lineNumber = parseInt(funcMatch[3], 10)
        
        // Skip internal files
        if (fileName.includes('logger.ts') || fileName.includes('node_modules')) {
          continue
        }
        
        return [fileName, lineNumber, funcName || null]
      }
      
      // 2. "    at file:line:column" format (no function name)
      const directMatch = line.match(/\s+at\s+(.+):(\d+):\d+/)
      if (directMatch && directMatch[1] && directMatch[2]) {
        const fileName = directMatch[1]
        const lineNumber = parseInt(directMatch[2], 10)
        
        // Skip internal files
        if (fileName.includes('logger.ts') || fileName.includes('node_modules')) {
          continue
        }
        
        return [fileName, lineNumber, null]
      }
    }
    
    return [null, null, null]
  }
}
