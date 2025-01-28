import { LoggerAdapter, LoggerRecord } from '@logone/core'
import { createCircularReplacer } from './create-circular-replacer'

interface NodeAdapterOptions {
  contentLengthLimit: number
}
export class NodeAdapter implements LoggerAdapter {
  constructor(private options: Partial<NodeAdapterOptions> = {}) {}

  output(record: LoggerRecord) {
    const write = (
      destination: 'stdout' | 'stderr',
      record: LoggerRecord & Partial<{ chunked: boolean }>
    ) => {
      const content = this.format(record)

      console.log('buffer', Buffer.byteLength(content), content.length)
      if (
        !this.options.contentLengthLimit ||
        Buffer.byteLength(content) < this.options.contentLengthLimit
      ) {
        this.write(destination, content)
      } else {
        const length = record.runtime.lines.length
        const half = Math.ceil(length / 2)

        if (length <= 1) {
          console.warn(
            `[Logone][node] separate lines by ${this.options.contentLengthLimit} bytes, cannot separate any more.`
          )
          this.write(destination, content)
          return
        }

        const separated = [
          record.runtime.lines.slice(0, half),
          record.runtime.lines.slice(half, length)
        ]

        separated.forEach((lines) => {
          write(destination, {
            ...record,
            chunked: true,
            runtime: {
              ...record.runtime,
              lines
            }
          })
        })
      }
    }

    const severity = record.runtime.severity
    const destination =
      severity === 'CRITICAL' || severity === 'ERROR' || severity === 'WARNING'
        ? 'stderr'
        : 'stdout'

    write(destination, record)
  }

  private format(record: LoggerRecord) {
    return `${JSON.stringify(record, createCircularReplacer())}\n`
  }

  private write(destination: 'stdout' | 'stderr', content: string) {
    process[destination].write(content)
  }
}

export function createAdapter(options: Partial<NodeAdapterOptions> = {}) {
  return new NodeAdapter(options)
}
