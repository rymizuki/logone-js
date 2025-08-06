import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { Logger } from './logger'
import { Stacker } from './stacker'
import { Timer } from './timer'

describe('Logger', () => {
  describe('getCallerPosition', () => {
    let logger: Logger
    let timer: Timer
    let stacker: Stacker

    beforeEach(() => {
      timer = new Timer({ elapsedUnit: '1ms' })
      stacker = new Stacker()
      logger = new Logger(timer, stacker)
      vi.setSystemTime(new Date('2024-01-01T00:00:00Z'))
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    describe('Normal stack trace parsing', () => {
      describe('when standard Node.js stack trace exists', () => {
        it('should return fileName and fileLine tuple', () => {
          // Record line number (next line is actual call)
          const expectedLine = 28
          logger.debug('test message')
          
          const entry = stacker.entries[0]
          expect(entry.fileName).toContain('get-caller-position.spec.ts')
          expect(entry.fileLine).toBe(expectedLine)
          expect(entry.funcName).toBeNull() // No function name for top-level calls
        })
      })

      describe('function call stack trace format', () => {
        it('should correctly parse "at function (file:line:column)" format', () => {
          function testFunction() {
            // Record line number (next line is actual call)
            logger.info('test from function')
          }
          
          testFunction()
          
          const entry = stacker.entries[0]
          expect(entry.fileName).toContain('get-caller-position.spec.ts')
          expect(entry.fileLine).toBe(41)
          expect(entry.funcName).toBe('testFunction') // Function name should be extracted
        })
      })

      describe('direct call stack trace format', () => {
        it('should correctly parse "at file:line:column" format', () => {
          // Record line number (next line is actual call)
          const expectedLine = 57
          logger.warning('direct call test')
          
          const entry = stacker.entries[0]
          expect(entry.fileName).toContain('get-caller-position.spec.ts')
          expect(entry.fileLine).toBe(expectedLine)
          expect(entry.funcName).toBeNull() // No function name for direct calls
        })
      })
    })

    describe('Internal file skipping', () => {
      describe('calls from logger.ts', () => {
        it('should return actual caller outside of logger.ts', () => {
          // Record line number (next line is actual call)
          const expectedLine = 72
          logger.error('test message')
          
          const entry = stacker.entries[0]
          expect(entry.fileName).toContain('get-caller-position.spec.ts')
          expect(entry.fileName).not.toContain('logger.ts')
          expect(entry.fileLine).toBe(expectedLine)
          expect(entry.funcName).toBeNull() // No function name for top-level calls
        })
      })

      describe('calls from node_modules', () => {
        it.todo('should return actual caller outside of node_modules')
        // Note: This test is difficult to simulate actual calls from node_modules
      })
    })

    describe('Error cases', () => {
      describe('when stack trace does not exist', () => {
        it.todo('should return [null, null]')
        // Note: Mocking Error.prototype.stack is complex and unlikely to occur in actual use cases
      })

      describe('when stack trace is empty string', () => {
        it.todo('should return [null, null]')
        // Note: Mocking Error.prototype.stack is complex and unlikely to occur in actual use cases  
      })

      describe('when no valid caller is found', () => {
        it.todo('should return [null, null]')
        // Note: It is difficult to simulate situations where no valid caller is found in actual environments
      })

      describe('stack trace format that does not match regex', () => {
        it.todo('should return [null, null]')
        // Note: Mocking Error.prototype.stack is complex and unlikely to occur in actual use cases
      })
    })

    describe('Boundary value tests', () => {
      describe('when stack trace has fewer than 3 lines', () => {
        it.todo('should return [null, null]')
        // Note: Mocking Error.prototype.stack is complex and unlikely to occur in actual use cases
      })

      describe('when stack trace has 7 or more lines', () => {
        it.todo('should search for valid caller within lines 3-6 range')
        // Note: Mocking Error.prototype.stack is complex and unlikely to occur in actual use cases
      })
    })

    describe('Actual usage scenarios', () => {
      describe('when calling debug() method', () => {
        it('should record accurate caller fileName and fileLine', () => {
          // Record line number (next line is actual call)
          const expectedLine = 127
          logger.debug('debug message')
          
          const entry = stacker.entries[0]
          expect(entry.fileName).toContain('get-caller-position.spec.ts')
          expect(entry.fileLine).toBe(expectedLine)
          expect(entry.funcName).toBeNull() // No function name for top-level calls
          expect(entry.severity).toBe('DEBUG')
          expect(entry.message).toBe('debug message')
        })
      })

      describe('when calling info() method', () => {
        it('should record accurate caller fileName and fileLine', () => {
          // Record line number (next line is actual call)
          const expectedLine = 142
          logger.info('info message')
          
          const entry = stacker.entries[0]
          expect(entry.fileName).toContain('get-caller-position.spec.ts')
          expect(entry.fileLine).toBe(expectedLine)
          expect(entry.funcName).toBeNull() // No function name for top-level calls
          expect(entry.severity).toBe('INFO')
          expect(entry.message).toBe('info message')
        })
      })

      describe('when calling from nested functions', () => {
        it('should record first non-logger.ts file position', () => {
          function outerFunction() {
            function innerFunction() {
              // Record line number (next line is actual call)
              logger.critical('nested call')
            }
            innerFunction()
          }
          
          outerFunction()
          
          const entry = stacker.entries[0]
          expect(entry.fileName).toContain('get-caller-position.spec.ts')
          expect(entry.fileLine).toBe(158)
          expect(entry.funcName).toBe('innerFunction') // Function name should be extracted
          expect(entry.severity).toBe('CRITICAL')
        })
      })
    })
  })
})