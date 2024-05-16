import { RequestHandler } from 'express'

import { LoggerInterface, createLogone, LogoneConfig } from '@logone/core'
import { createAdapter } from '@logone/adapter-node'

declare module 'express-serve-static-core' {
  interface Request {
    logger: LoggerInterface
  }
}

const createHandler = (config: LogoneConfig = {}) => {
  const middleware: RequestHandler = (req, res, next) => {
    const logone = createLogone(createAdapter(), config)
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
