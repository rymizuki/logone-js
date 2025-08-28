import { convertObjectToString } from './helpers/convert-object-to-string'
import { excludeRecursiveReference } from './helpers/exclude-recursive-reference'
import { filterSeverityByLevel } from './helpers/log-level'
import { maskPayloadSecretParameters } from './helpers/mask-secret-parameters'
import {
  LogRecord,
  LoggerAdapter,
  LoggerAdapterInput,
  LoggerConfig,
  LoggerContext,
  LoggerSeverity,
  StreamingAdapter
} from './interface'
import { Logger } from './logger'
import { severities } from './severity'
import { Stacker } from './stacker'
import { Timer } from './timer'

export class Logone {
  private config: LoggerConfig
  private listeners = new Set<(entry: LogRecord) => void>()
  private adapters: LoggerAdapter[]

  constructor(
    adapterInput: LoggerAdapterInput,
    config: Partial<LoggerConfig> = {}
  ) {
    this.adapters = Array.isArray(adapterInput) ? adapterInput : [adapterInput]
    this.config = {
      elapsedUnit: '1ms',
      maskKeywords: [],
      logLevel: 'DEBUG',
      ...config
    }
  }

  /** @deprecated Use constructor with LoggerAdapterInput instead */
  private get adapter(): LoggerAdapter {
    return this.adapters[0]!
  }

  start(type: string, context: LoggerContext = {}) {
    const timer = new Timer({
      elapsedUnit: this.config.elapsedUnit
    })
    const stacker = new Stacker()

    // Create logger with onEntry callback
    const logger = new Logger(timer, stacker, {
      onEntry: (entry: LogRecord) => {
        // Notify all subscribers
        this.listeners.forEach((listener) => {
          try {
            listener(entry)
          } catch (error) {
            // Ignore errors in listeners to prevent disruption
            console.error('Error in log entry listener:', error)
          }
        })

        // Also notify streaming adapters if available
        this.adapters.forEach((adapter) => {
          const streamingAdapter = adapter as StreamingAdapter
          if (streamingAdapter.onEntry) {
            try {
              streamingAdapter.onEntry(entry, this.config)
            } catch (error) {
              console.error('Error in streaming adapter onEntry:', error)
            }
          }
        })
      }
    })

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

      this.adapters.forEach((adapter) => {
        try {
          adapter.output(record)
        } catch (error) {
          console.error('Error in adapter output:', error)
        }
      })
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

  subscribe(listener: (entry: LogRecord) => void): () => void {
    this.listeners.add(listener)

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }
}
