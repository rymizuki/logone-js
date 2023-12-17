import { Adapter } from './adapter'
import { Provider } from './provider'
import { Logger, LoggerInterface } from './logger'
import { Timer } from './timer'

type LoggerFinishFunction = () => void

export class LoggerManager {
  constructor(
    private adapter: Adapter,
    private provider: Provider
  ) {}

  recording(): [LoggerInterface, LoggerFinishFunction] {
    const logger = this.createLogger()
    const finish = () => {
      logger.finish()
    }
    logger.start()
    return [logger, finish]
  }

  private createLogger() {
    return new Logger(new Timer(), this.adapter, this.provider)
  }
}
