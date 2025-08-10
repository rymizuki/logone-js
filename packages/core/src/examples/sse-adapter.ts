import {
  LogRecord,
  StreamingAdapter,
  LogoneConfig,
  LoggerRecord
} from '../interface'
import { filterSeverityByLevel } from '../helpers/log-level'
import { maskPayloadSecretParameters } from '../helpers/mask-secret-parameters'
import { convertObjectToString } from '../helpers/convert-object-to-string'

/**
 * Example SSE (Server-Sent Events) adapter implementation
 * This adapter streams log entries in real-time to connected clients
 */
export class SSEAdapter implements StreamingAdapter {
  constructor(
    private response: {
      write: (data: string) => void
      end: () => void
    }
  ) {}

  /**
   * Called for each log entry as it occurs
   * Filters and masks entries before sending to client
   */
  onEntry(entry: LogRecord, config: LogoneConfig): void {
    // Apply log level filtering
    const severityLevel = config.logLevel || 'DEBUG'
    const filtered = filterSeverityByLevel(severityLevel, [entry])

    if (filtered.length === 0) {
      return // Entry filtered out by log level
    }

    // Apply masking
    const masked = maskPayloadSecretParameters(
      convertObjectToString([entry]),
      config.maskKeywords || []
    )

    if (masked.length > 0) {
      // Send as SSE event
      const data = JSON.stringify({
        type: 'log',
        entry: masked[0]
      })

      this.response.write(`data: ${data}\n\n`)
    }
  }

  /**
   * Called at the end with the complete log record
   */
  output(record: LoggerRecord): void {
    // Send final summary
    const data = JSON.stringify({
      type: 'summary',
      record
    })

    this.response.write(`data: ${data}\n\n`)
    this.response.end()
  }
}

/**
 * Example usage with Express.js:
 *
 * app.get('/logs/stream', (req, res) => {
 *   res.setHeader('Content-Type', 'text/event-stream')
 *   res.setHeader('Cache-Control', 'no-cache')
 *   res.setHeader('Connection', 'keep-alive')
 *
 *   const adapter = new SSEAdapter(res)
 *   const logone = new Logone(adapter, {
 *     logLevel: 'INFO',
 *     maskKeywords: ['password', 'token']
 *   })
 *
 *   const { logger, finish } = logone.start('sse-request', {
 *     requestId: req.id
 *   })
 *
 *   // Your application logic here
 *   logger.info('Processing request')
 *   // ...
 *
 *   req.on('close', () => {
 *     finish()
 *   })
 * })
 */

/**
 * Example with subscription pattern:
 *
 * app.get('/logs/subscribe', (req, res) => {
 *   res.setHeader('Content-Type', 'text/event-stream')
 *   res.setHeader('Cache-Control', 'no-cache')
 *
 *   const logone = getSharedLogoneInstance()
 *
 *   const unsubscribe = logone.subscribe((entry) => {
 *     const data = JSON.stringify({
 *       type: 'log',
 *       entry
 *     })
 *     res.write(`data: ${data}\n\n`)
 *   })
 *
 *   req.on('close', () => {
 *     unsubscribe()
 *   })
 * })
 */
