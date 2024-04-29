import { LoggerAdapter } from './interface'
import { Logone } from './logone'

export { type LoggerInterface, type LoggerRecord } from './interface'
export { type LoggerAdapter }

export function createLogone(adapter: LoggerAdapter) {
  return new Logone(adapter)
}
