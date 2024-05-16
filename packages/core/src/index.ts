import { LoggerAdapter, LoggerConfig } from './interface'
import { Logone } from './logone'

export { type LoggerInterface, type LoggerRecord } from './interface'
export { type LoggerAdapter }

export function createLogone(
  adapter: LoggerAdapter,
  config: Partial<LoggerConfig> = {}
) {
  return new Logone(adapter, config)
}
