import { convertObjectToString } from './helpers/convert-object-to-string'
import { excludeRecursiveReference } from './helpers/exclude-recursive-reference'
import { filterSeverityByLevel } from './helpers/log-level'
import { maskPayloadSecretParameters } from './helpers/mask-secret-parameters'
import {
  LogRecord,
  LoggerAdapter,
  LoggerConfig,
  LoggerContext,
  LoggerSeverity
} from './interface'
import { Logger } from './logger'
import { severities } from './severity'
import { Stacker } from './stacker'
import { Timer } from './timer'

export class Logone {
  private config: LoggerConfig

  constructor(
    private adapter: LoggerAdapter,
    config: Partial<LoggerConfig> = {}
  ) {
    this.config = {
      elapsedUnit: '1ms',
      maskKeywords: [],
      logLevel: 'DEBUG',
      ...config
    }
  }

  start(type: string, context: LoggerContext = {}) {
    const timer = new Timer({
      elapsedUnit: this.config.elapsedUnit
    })
    const stacker = new Stacker()
    const logger = new Logger(timer, stacker)

    timer.start()

    const finish = () => {
      timer.end()

      if (!stacker.hasEntries()) return

      const lines = maskPayloadSecretParameters(
        convertObjectToString(
          excludeRecursiveReference(
            filterSeverityByLevel(this.config.logLevel, stacker.entries)
          )
        ),
        this.config.maskKeywords
      )
      if (!lines.length) return

      const severity = this.getHighestSeverity(lines)
      const record = {
        type,
        context,
        runtime: {
          severity,
          startTime: timer.startTime,
          endTime: timer.endTime,
          elapsed: timer.elapsed,
          lines
        },
        config: this.config
      }

      this.adapter.output(record)
    }

    return {
      logger,
      finish
    }
  }

  private getHighestSeverity(entries: LogRecord[]): LoggerSeverity {
    const level = entries
      .map(({ severity }) => severities[severity])
      .reduce((prev, level) => (prev < level ? level : prev), 0)
    const severity = (
      Object.keys(severities) as (keyof typeof severities)[]
    ).find((severity) => severities[severity] === level)
    if (!severity) {
      throw new Error('Logger has no entry by based on severity')
    }
    return severity
  }
}
