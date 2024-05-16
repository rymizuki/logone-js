import { LoggerAdapter, LogoneConfig } from './interface'
import { Logone } from './logone'

export {
  type LoggerInterface,
  type LoggerRecord,
  type LogoneConfig
} from './interface'
export { type LoggerAdapter }

export function createLogone(
  adapter: LoggerAdapter,
  config: LogoneConfig = {}
) {
  return new Logone(adapter, config)
}
