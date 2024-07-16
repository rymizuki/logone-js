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
