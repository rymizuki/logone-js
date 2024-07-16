import { RequestHandler } from 'express'

import {
  LoggerInterface,
  createLogone,
  LogoneConfig,
  LoggerAdapter
} from '@logone/core'
import { createAdapter } from '@logone/adapter-node'

declare module 'express-serve-static-core' {
  interface Request {
    logger: LoggerInterface
  }
}

const createHandler = (config: LogoneConfig = {}, adapter?: LoggerAdapter) => {
  const middleware: RequestHandler = (req, res, next) => {
    const logone = createLogone(adapter ?? createAdapter(), config)
    const { logger, finish } = logone.start('request', {
      method: req.method,
      url: req.url,
      host: req.headers.host,
      contentType: req.headers['content-type'],
      userAgent: req.headers['user-agent']
    })

    req.logger = logger
    res.on('close', () => {
      setTimeout(() => {
        finish()
      }, 0)
    })

    next()
  }
  return middleware
}

export { createHandler }
