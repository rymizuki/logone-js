import { LoggerAdapter, LoggerRecord } from '@logone/core'

class NodeAdapter implements LoggerAdapter {
  output(record: LoggerRecord) {
    const severity = record.runtime.severity
    if (
      severity === 'CRITICAL' ||
      severity === 'ERROR' ||
      severity === 'WARNING'
    ) {
      this.outputToStderr(record)
    } else {
      this.outputToStdout(record)
    }
  }

  private outputToStderr(record: LoggerRecord) {
    process.stderr.write(`${JSON.stringify(record, getCircularReplacer())}\n`)
  }

  private outputToStdout(record: LoggerRecord) {
    process.stdout.write(`${JSON.stringify(record, getCircularReplacer())}\n`)
  }
}

function getCircularReplacer() {
  const seen = new WeakSet()
  return (_key: string, value: unknown) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return
      seen.add(value)
    }
    return value
  }
}

export function createAdapter() {
  return new NodeAdapter()
}
