# @logone/core

This library is logger that supports structured logging by generating a single line of JSON format for your specified lifecycle.
Inspired by [logone-go](https://github.com/hixi-hyi/logone-go).

## Installation

```sh
npm install @logone/core @logone/adapter-node
```

## Usage

### The simple example

```typescript
import { createLogone } from '@logone/core'
import { createAdapter } from '@logone/adapter-node'

const logone = createLogone(createAdapter())
const main = () => {
  const { logger, finish } = logone.start('example')

  logger.info('hello world')

  finish()
}
```

### The express example

This is internal implementation of [@logone/express](../express/README.md).

```typescript
import express from 'express'

import { createLogone } from '@logone/core'
import { createAdapter } from '@logone/adapter-node'

const app = express()

app.use((req, res, next) => {
  const logone = createLogone(createAdapter())
  const { logger, finish } = logone.start('request', {
    method: req.method,
    url: req.url
  })
  req.logger = logger

  res.on('close', () => {
    setTimeout(() => {
      finish()
    }, 0)
  })

  next()
})

app.use((error, req, res) => {
  req.logger.error(error)
  res.send(500)
})

app.get('/example', (req, res) => {
  req.logger.info('example')
  res.send(200)
})
```

### Filter by log level

can narrow down to only those severities with a specified log level or higher.

```ts
const logone = createLogone(createAdapter(), {
  logLevel: 'INFO'
})
const main = () => {
  const { logger, finish } = logone.start('example')

  logger.debug('no output')
  logger.info('output')
  logger.error('output')

  finish()
}
```

## Severity

- debug
- info
- warning
- error
- critical

## Streaming Support

The library now supports real-time log streaming for scenarios like Server-Sent Events (SSE).

### Using StreamingAdapter

```typescript
import { createLogone, StreamingAdapter } from '@logone/core'

class SSEAdapter implements StreamingAdapter {
  constructor(private response: Response) {}

  onEntry(entry: LogRecord, config: LogoneConfig) {
    // Called for each log entry in real-time
    // Apply filtering based on config.logLevel
    const data = JSON.stringify({ type: 'log', entry })
    this.response.write(`data: ${data}\n\n`)
  }

  output(record: LoggerRecord) {
    // Called at the end with complete summary
    const data = JSON.stringify({ type: 'summary', record })
    this.response.write(`data: ${data}\n\n`)
    this.response.end()
  }
}

// Usage in Express
app.get('/logs/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  
  const adapter = new SSEAdapter(res)
  const logone = createLogone(adapter, { logLevel: 'INFO' })
  const { logger, finish } = logone.start('sse-request')
  
  // Your logic here...
  
  req.on('close', () => finish())
})
```

### Using Subscribe/Unsubscribe Pattern

```typescript
import { Logone } from '@logone/core'

const logone = new Logone(adapter)

// Subscribe to log entries
const unsubscribe = logone.subscribe((entry) => {
  console.log('New log entry:', entry)
})

const { logger, finish } = logone.start('example')
logger.info('This will trigger the subscriber')

// Unsubscribe when done
unsubscribe()
finish()
```

### Multiple Subscribers

```typescript
const subscribers = new Set()

// Add multiple subscribers
const unsub1 = logone.subscribe(entry => console.log('Sub1:', entry))
const unsub2 = logone.subscribe(entry => console.log('Sub2:', entry))

// Both subscribers will receive all log entries

// Cleanup
unsub1()
unsub2()
```
