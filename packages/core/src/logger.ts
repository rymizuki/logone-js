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
    
    // 適切なコールスタックの行を見つける（通常は3-5行目あたり）
    for (let i = 3; i < Math.min(rows.length, 7); i++) {
      const line = rows[i]
      if (!line) continue
      
      // Node.jsのスタックトレース形式を解析
      // 1. "    at functionName (file:line:column)" 形式
      const funcMatch = line.match(/\s+at\s+([^(]+)\s*\((.+):(\d+):\d+\)/)
      if (funcMatch && funcMatch[1] && funcMatch[2] && funcMatch[3]) {
        const funcName = funcMatch[1].trim()
        const fileName = funcMatch[2]
        const lineNumber = parseInt(funcMatch[3], 10)
        
        // 内部ファイルをスキップ
        if (fileName.includes('logger.ts') || fileName.includes('node_modules')) {
          continue
        }
        
        return [fileName, lineNumber, funcName || null]
      }
      
      // 2. "    at file:line:column" 形式（関数名なし）
      const directMatch = line.match(/\s+at\s+(.+):(\d+):\d+/)
      if (directMatch && directMatch[1] && directMatch[2]) {
        const fileName = directMatch[1]
        const lineNumber = parseInt(directMatch[2], 10)
        
        // 内部ファイルをスキップ
        if (fileName.includes('logger.ts') || fileName.includes('node_modules')) {
          continue
        }
        
        return [fileName, lineNumber, null]
      }
    }
    
    return [null, null, null]
  }
}
