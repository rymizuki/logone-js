import { LoggerRecord } from './'

export interface Provider {
  output(record: LoggerRecord): void
}
