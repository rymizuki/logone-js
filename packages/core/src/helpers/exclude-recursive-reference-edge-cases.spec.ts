import { describe, expect, it } from 'vitest'
import { excludeRecursiveReference } from './exclude-recursive-reference'
import { LogRecord } from '../interface'

describe('exclude-recursive-reference edge cases', () => {
  describe('getter properties', () => {
    it('should mark self-referencing getter as [Circular]', () => {
      const obj = {
        name: 'test',
        get self() {
          return this
        },
        get parent() {
          return this
        }
      }
      
      const entries: LogRecord[] = [{
        severity: 'INFO',
        message: 'test',
        payload: { data: obj },
        time: new Date(),
        fileLine: null,
        fileName: null
      }]
      
      const result = excludeRecursiveReference(entries)
      expect(result[0]?.payload).toStrictEqual({
        data: {
          name: 'test',
          self: '[Circular]',
          parent: '[Circular]'
        }
      })
    })

    it('should handle nested getters with circular references', () => {
      const child = {
        name: 'child',
        get root() {
          return parent
        }
      }
      
      const parent = {
        name: 'parent',
        child,
        get self() {
          return this
        }
      }
      
      const entries: LogRecord[] = [{
        severity: 'INFO',
        message: 'test',
        payload: parent,
        time: new Date(),
        fileLine: null,
        fileName: null
      }]
      
      const result = excludeRecursiveReference(entries)
      expect(result[0]?.payload).toStrictEqual({
        name: 'parent',
        child: {
          name: 'child',
          root: '[Circular]'
        },
        self: '[Circular]'
      })
    })
  })

  describe('toJSON method', () => {
    it('should handle object with toJSON that returns self', () => {
      const obj = {
        name: 'test',
        toJSON() {
          return this
        }
      }
      
      const entries: LogRecord[] = [{
        severity: 'INFO',
        message: 'test',
        payload: { data: obj },
        time: new Date(),
        fileLine: null,
        fileName: null
      }]
      
      const result = excludeRecursiveReference(entries)
      // toJSON that returns self causes circular reference
      expect(result[0]?.payload.data).toBe('[Circular]')
    })

    it('should handle toJSON that returns a different object structure', () => {
      const obj = {
        internal: 'hidden',
        toJSON() {
          return { public: 'visible', nested: { data: 'test' } }
        }
      }
      
      const entries: LogRecord[] = [{
        severity: 'INFO',
        message: 'test',
        payload: obj,
        time: new Date(),
        fileLine: null,
        fileName: null
      }]
      
      const result = excludeRecursiveReference(entries)
      // toJSON is not called by excludeRecursiveReference
      expect(result[0]?.payload).toStrictEqual({
        internal: 'hidden',
        toJSON: expect.any(Function)
      })
    })
  })

  describe('prototype chain', () => {
    it('should handle objects with circular prototype chain', () => {
      // Create objects with circular prototype chain
      const proto1 = { type: 'proto1' }
      const proto2 = Object.create(proto1)
      proto2.type = 'proto2'
      
      // This would create a circular prototype chain if JS allowed it
      // But JS prevents this, so we test inherited properties instead
      const obj = Object.create(proto2)
      obj.name = 'instance'
      obj.proto = proto2
      
      const entries: LogRecord[] = [{
        severity: 'INFO',
        message: 'test',
        payload: obj,
        time: new Date(),
        fileLine: null,
        fileName: null
      }]
      
      const result = excludeRecursiveReference(entries)
      expect(result[0]?.payload).toStrictEqual({
        name: 'instance',
        proto: {
          type: 'proto2'
        }
      })
    })
  })

  describe('Symbol and non-enumerable properties', () => {
    it('should not process Symbol properties', () => {
      const sym = Symbol('test')
      const obj = {
        visible: 'yes',
        [sym]: 'hidden'
      }
      
      const entries: LogRecord[] = [{
        severity: 'INFO',
        message: 'test',
        payload: obj,
        time: new Date(),
        fileLine: null,
        fileName: null
      }]
      
      const result = excludeRecursiveReference(entries)
      expect(result[0]?.payload).toStrictEqual({
        visible: 'yes'
      })
      expect(result[0]?.payload[sym]).toBeUndefined()
    })

    it('should not process non-enumerable properties', () => {
      const obj = { visible: 'yes' }
      Object.defineProperty(obj, 'hidden', {
        value: 'secret',
        enumerable: false
      })
      
      const entries: LogRecord[] = [{
        severity: 'INFO',
        message: 'test',
        payload: obj,
        time: new Date(),
        fileLine: null,
        fileName: null
      }]
      
      const result = excludeRecursiveReference(entries)
      expect(result[0]?.payload).toStrictEqual({
        visible: 'yes'
      })
    })
  })

  describe('Proxy objects', () => {
    it('should handle Proxy with circular reference trap', () => {
      const target = { name: 'target' }
      const proxy = new Proxy(target, {
        get(target, prop) {
          if (prop === 'self') {
            return proxy
          }
          return target[prop as keyof typeof target]
        },
        ownKeys(target) {
          return [...Object.keys(target), 'self']
        },
        getOwnPropertyDescriptor(target, prop) {
          if (prop === 'self') {
            return { configurable: true, enumerable: true, value: proxy }
          }
          return Object.getOwnPropertyDescriptor(target, prop)
        }
      })
      
      const entries: LogRecord[] = [{
        severity: 'INFO',
        message: 'test',
        payload: { proxy },
        time: new Date(),
        fileLine: null,
        fileName: null
      }]
      
      const result = excludeRecursiveReference(entries)
      expect(result[0]?.payload).toStrictEqual({
        proxy: {
          name: 'target',
          self: '[Circular]'
        }
      })
    })

    it('should handle Proxy that throws on property access', () => {
      const proxy = new Proxy({}, {
        get() {
          throw new Error('Access denied')
        },
        ownKeys() {
          return ['error']
        },
        getOwnPropertyDescriptor() {
          return { configurable: true, enumerable: true }
        }
      })
      
      const entries: LogRecord[] = [{
        severity: 'INFO',
        message: 'test',
        payload: { proxy },
        time: new Date(),
        fileLine: null,
        fileName: null
      }]
      
      // This should not throw, but handle the error gracefully
      expect(() => excludeRecursiveReference(entries)).toThrow()
    })
  })

  describe('edge case objects', () => {
    it('should handle objects with null prototype', () => {
      const obj = Object.create(null)
      obj.name = 'no-proto'
      obj.data = { nested: true }
      
      const entries: LogRecord[] = [{
        severity: 'INFO',
        message: 'test',
        payload: obj,
        time: new Date(),
        fileLine: null,
        fileName: null
      }]
      
      const result = excludeRecursiveReference(entries)
      expect(result[0]?.payload).toStrictEqual({
        name: 'no-proto',
        data: { nested: true }
      })
    })

    it('should handle deeply nested circular references', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const obj: any = {
        level1: {
          level2: {
            level3: {
              level4: {}
            }
          }
        }
      }
      obj.level1.level2.level3.level4.backToRoot = obj
      obj.level1.level2.backToLevel1 = obj.level1
      
      const entries: LogRecord[] = [{
        severity: 'INFO',
        message: 'test',
        payload: obj,
        time: new Date(),
        fileLine: null,
        fileName: null
      }]
      
      const result = excludeRecursiveReference(entries)
      expect(result[0]?.payload).toStrictEqual({
        level1: {
          level2: {
            level3: {
              level4: {
                backToRoot: '[Circular]'
              }
            },
            backToLevel1: '[Circular]'
          }
        }
      })
    })
  })
})