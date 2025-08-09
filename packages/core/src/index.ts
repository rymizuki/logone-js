import { LoggerAdapter, LogoneConfig } from './interface'
import { Logone } from './logone'

export {
  type LoggerInterface,
  type LoggerRecord,
  type LogoneConfig,
  type StreamingAdapter,
  type LogRecord
} from './interface'
export { type LoggerAdapter }
export { Logone }

export function createLogone(
  adapter: LoggerAdapter,
  config: LogoneConfig = {}
) {
  return new Logone(adapter, config)
}
