import { LoggerAdapter, LoggerRecord } from '@logone/core'
import { NodeAdapter } from '@logone/adapter-node'

class GoogleCloudLoggingAdapter implements LoggerAdapter {
  private adapter: LoggerAdapter

  constructor() {
    this.adapter = new NodeAdapter({
      contentLengthLimit: 16 * 1024
    })
  }
  output(record: LoggerRecord) {
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

    this.adapter.output(data)
  }
}

export function createAdapter() {
  return new GoogleCloudLoggingAdapter()
}
