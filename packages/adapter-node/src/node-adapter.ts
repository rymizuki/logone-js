import { LoggerAdapter, LoggerRecord } from '@logone/core'
import { createCircularReplacer } from './create-circular-replacer'

export class NodeAdapter implements LoggerAdapter {
  output(record: LoggerRecord) {
    const severity = record.runtime.severity
    const content = this.format(record)

    const destination =
      severity === 'CRITICAL' || severity === 'ERROR' || severity === 'WARNING'
        ? 'stderr'
        : 'stdout'
    this.write(destination, content)
  }

  private format(record: LoggerRecord) {
    return `${JSON.stringify(record, createCircularReplacer())}\n`
  }

  private write(destination: 'stdout' | 'stderr', content: string) {
    process[destination].write(content)
  }
}

export function createAdapter() {
  return new NodeAdapter()
}
