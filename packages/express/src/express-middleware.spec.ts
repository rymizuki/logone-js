import { vars, waitTimeout } from '@logone/test-helper'
import { NextFunction, Request, RequestHandler, Response } from 'express'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import logone from './'
import EventEmitter from 'events'

const v = vars<{
  handler: RequestHandler
  request: Request
  response: Response
  next: NextFunction
  events: EventEmitter
}>()

describe('express-middleware', () => {
  beforeEach(() => {
    const handler = logone()
    v.set('handler', handler)

    const events = new EventEmitter()
    v.set('events', events)

    const req = {
      method: 'get',
      url: '/example',
      headers: {
        host: 'example.com',
        'content-type': 'application/json',
        'user-agent': 'example'
      }
    } as Request
    const res = {
      on(name: string, fn: () => void) {
        events.on(name, fn)
      }
    } as Response
    const next = (() => {}) as NextFunction
    v.set('request', req)
    v.set('response', res)
    v.set('next', next)

    handler(req, res, next)
  })
  afterEach(() => {
    v.clear()
  })

  describe('basic case', () => {
    it('should be export req.logger', () => {
      expect(v.get('request')).toHaveProperty('logger')
    })
    it('should be output to adapter on response closed', async () => {
      const spy = vi
        .spyOn(process.stdout, 'write')
        .mockImplementation(() => true)

      v.get('request')?.logger.info('test')
      v.get('events')?.emit('close')

      await waitTimeout(1)

      expect(spy).toBeCalled()
    })
  })
})
