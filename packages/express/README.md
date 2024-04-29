# @logone/express

Middleware that using logone on express.

## Installation

```sh
npm install @logone/express
```

## Usage

```typescript
import logone from '@logone/express'

app.use(logone())

app.use((req, res, next) => {
  req.logger.info('prepare')
  next()
})

app.use((error, req, res, next) => {
  req.logger.error(error)
  res.send(500)
})

app.get('/example', (req, res) => {
  req.logger.info('hello')
  res.send(200)
})
```
