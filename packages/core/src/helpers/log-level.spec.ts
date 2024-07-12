import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LogRecord } from '../interface'
import { filterSeverityByLevel } from './log-level'

describe('logLevel', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.clearAllTimers()
  })

  let entries: LogRecord[]
  beforeEach(() => {
    entries = [
      {
        severity: 'DEBUG',
        message: 'debug record',
        payload: {},
        time: new Date(),
        fileLine: null,
        fileName: null
      },
      {
        severity: 'INFO',
        message: 'debug record',
        payload: {},
        time: new Date(),
        fileLine: null,
        fileName: null
      },
      {
        severity: 'WARNING',
        message: 'debug record',
        payload: {},
        time: new Date(),
        fileLine: null,
        fileName: null
      },
      {
        severity: 'ERROR',
        message: 'debug record',
        payload: {},
        time: new Date(),
        fileLine: null,
        fileName: null
      },
      {
        severity: 'CRITICAL',
        message: 'debug record',
        payload: {},
        time: new Date(),
        fileLine: null,
        fileName: null
      }
    ]
  })

  describe('level=DEBUG', () => {
    let output: LogRecord[]
    beforeEach(() => {
      output = filterSeverityByLevel('DEBUG', entries)
    })
    it('should be has DEBUG entry', () => {
      expect(output).toStrictEqual(entries)
    })
  })

  describe('level=INFO', () => {
    let output: LogRecord[]
    beforeEach(() => {
      output = filterSeverityByLevel('INFO', entries)
    })
    it('should be has INFO entry and has not DEBUG entry', () => {
      expect(output).toStrictEqual(
        entries.filter(({ severity }) => severity !== 'DEBUG')
      )
    })
  })

  describe('level=WARNING', () => {
    let output: LogRecord[]
    beforeEach(() => {
      output = filterSeverityByLevel('WARNING', entries)
    })
    it('should be has WARNING entry and has not DEBUG, INFO entry', () => {
      expect(output).toStrictEqual(
        entries.filter(
          ({ severity }) => severity !== 'DEBUG' && severity !== 'INFO'
        )
      )
    })
  })

  describe('level=ERROR', () => {
    let output: LogRecord[]
    beforeEach(() => {
      output = filterSeverityByLevel('ERROR', entries)
    })
    it('should be has ERROR entry and has not DEBUG, INFO, WARNING entry', () => {
      expect(output).toStrictEqual(
        entries.filter(
          ({ severity }) =>
            severity !== 'DEBUG' &&
            severity !== 'INFO' &&
            severity !== 'WARNING'
        )
      )
    })
  })

  describe('level=CRITICAL', () => {
    let output: LogRecord[]
    beforeEach(() => {
      output = filterSeverityByLevel('CRITICAL', entries)
    })
    it('should be has CRITICAL entry and has not DEBUG, INFO, WARNING, ERROR entry', () => {
      expect(output).toStrictEqual(
        entries.filter(
          ({ severity }) =>
            severity !== 'DEBUG' &&
            severity !== 'INFO' &&
            severity !== 'WARNING' &&
            severity !== 'ERROR'
        )
      )
    })
  })
})
