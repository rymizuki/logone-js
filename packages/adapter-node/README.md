# @logone/adapter-node

## Installation

```sh
npm install @logone/core @logone/adapter-node
```

## Usage

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
