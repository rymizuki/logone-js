# @logone/adapter-google-cloud-logging

## Installation

```sh
npm install @logone/core @logone/adapter-google-cloud-logging
```

## Usage

```typescript
import { createLogone } from '@logone/core'
import { createAdapter } from '@logone/adapter-google-cloud-logging'

const logone = createLogone(createAdapter())
const main = () => {
  const { logger, finish } = logone.start('example')

  logger.info('hello world')

  finish()
}
```
