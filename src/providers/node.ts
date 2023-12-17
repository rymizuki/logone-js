import { LoggerProvider, LoggerRecord } from '..'

class NodeProvider implements LoggerProvider {
  output(record: LoggerRecord): void {
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
    process.stderr.write(`${JSON.stringify(record)}\n`)
  }

  private outputToStdout(record: LoggerRecord) {
    process.stdout.write(`${JSON.stringify(record)}\n`)
  }
}

export function createProvider() {
  return new NodeProvider()
}
