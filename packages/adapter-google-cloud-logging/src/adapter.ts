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

  private format(record: LoggerRecord) {
    const data: LoggerRecord & {
      time: string | Date
      severity: LoggerRecord['runtime']['severity']
      message?: string
    } = {
      ...record,
      time: record.runtime.startTime,
      severity: record.runtime.severity
    }
    if (data.severity === 'ERROR') {
      data.message = record.runtime.lines.find(
        (line) => line.severity === 'ERROR'
      )?.message
    }
    if (data.severity === 'CRITICAL') {
      data.message = record.runtime.lines.find(
        (line) => line.severity === 'CRITICAL'
      )?.message
    }
    return `${JSON.stringify(data)}\n`
  }

  private outputToStderr(record: LoggerRecord) {
    process.stderr.write(this.format(record))
  }

  private outputToStdout(record: LoggerRecord) {
    process.stdout.write(this.format(record))
  }
}

export function createAdapter() {
  return new NodeAdapter()
}
