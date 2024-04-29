import { LogRecord } from './interface'

export class Stacker {
  private rows: LogRecord[] = []

  get entries() {
    return this.rows
  }

  stack(entry: LogRecord) {
    this.rows.push(entry)
  }

  hasEntries() {
    return 0 < this.entries.length
  }
}
