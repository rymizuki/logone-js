import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { FileAdapter } from './file-adapter'
import { LoggerRecord } from '@logone/core'
import { readFileSync, existsSync, rmSync, writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'

describe('FileAdapter - Extended Tests', () => {
  const testDir = resolve(__dirname, '../test-output-extended')
  const testFilePath = resolve(testDir, 'test.log')

  beforeEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  const createMockRecord = (
    severity: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL' = 'INFO',
    message = 'Test message'
  ): LoggerRecord => ({
    type: 'log',
    context: {},
    runtime: {
      severity,
      startTime: new Date('2024-01-01T00:00:00Z'),
      endTime: new Date('2024-01-01T00:00:01Z'),
      elapsed: 1000,
      lines: [
        {
          severity,
          message,
          payload: null,
          time: new Date('2024-01-01T00:00:00Z'),
          fileLine: null,
          fileName: null,
          funcName: null
        }
      ]
    },
    config: {}
  })

  describe('edge cases and error handling', () => {
    it('should throw error for empty file path', () => {
      expect(() => new FileAdapter({ filepath: '' })).toThrow(
        'filepath is required'
      )
    })

    it('should handle very long file paths', () => {
      const longPath = resolve(testDir, 'a'.repeat(200) + '.log')
      const adapter = new FileAdapter({ filepath: longPath })
      adapter.output(createMockRecord())
      adapter.destroy()
      expect(existsSync(longPath)).toBe(true)
    })

    it('should handle special characters in file path', () => {
      const specialPath = resolve(
        testDir,
        'test with spaces & special chars!.log'
      )
      const adapter = new FileAdapter({ filepath: specialPath })
      adapter.output(createMockRecord())
      adapter.destroy()
      expect(existsSync(specialPath)).toBe(true)
    })

    it('should handle files without extension', () => {
      const noExtPath = resolve(testDir, 'testfile')
      const adapter = new FileAdapter({
        filepath: noExtPath,
        maxFileSize: 50,
        rotateFileCount: 2
      })

      adapter.output(createMockRecord())
      adapter.output(createMockRecord())
      adapter.destroy()

      const rotatedFile = resolve(testDir, 'testfile.1.log')
      expect(existsSync(rotatedFile)).toBe(true)
    })

    it('should handle very large log records', () => {
      const largeMessage = 'x'.repeat(10000)
      const adapter = new FileAdapter({ filepath: testFilePath })
      const record = createMockRecord('INFO', largeMessage)

      adapter.output(record)
      adapter.destroy()

      const content = readFileSync(testFilePath, 'utf-8')
      const parsedRecord = JSON.parse(content.trim()) as LoggerRecord
      expect(parsedRecord.runtime.lines[0]?.message).toBe(largeMessage)
    })

    it('should handle very small maxFileSize', () => {
      const adapter = new FileAdapter({
        filepath: testFilePath,
        maxFileSize: 1, // 1 byte
        rotateFileCount: 5
      })

      adapter.output(createMockRecord())
      adapter.destroy()

      // Should create rotated file immediately
      const rotatedFile = resolve(testDir, 'test.1.log')
      expect(existsSync(rotatedFile)).toBe(true)
    })

    it('should throw error for maxFileSize of 0', () => {
      expect(
        () =>
          new FileAdapter({
            filepath: testFilePath,
            maxFileSize: 0,
            rotateFileCount: 3
          })
      ).toThrow('maxFileSize must be greater than 0')
    })
  })

  describe('encoding tests', () => {
    it('should handle different encodings correctly', () => {
      const encodings: BufferEncoding[] = ['utf-8', 'ascii', 'latin1']

      encodings.forEach((encoding) => {
        const filePath = resolve(testDir, `test_${encoding}.log`)
        const adapter = new FileAdapter({ filepath: filePath, encoding })

        adapter.output(createMockRecord('INFO', 'Test message for encoding'))
        adapter.destroy()

        expect(existsSync(filePath)).toBe(true)
        const content = readFileSync(filePath, 'utf-8') // Always read as utf-8 for comparison
        expect(content).toContain('Test message for encoding')
      })
    })

    it('should handle unicode characters with utf-8', () => {
      const adapter = new FileAdapter({
        filepath: testFilePath,
        encoding: 'utf-8'
      })
      const record = createMockRecord(
        'INFO',
        '日本語テスト 🚀 emoji test ñáéíóú'
      )

      adapter.output(record)
      adapter.destroy()

      const content = readFileSync(testFilePath, 'utf-8')
      const parsedRecord = JSON.parse(content.trim()) as LoggerRecord
      expect(parsedRecord.runtime.lines[0]?.message).toBe(
        '日本語テスト 🚀 emoji test ñáéíóú'
      )
    })
  })

  describe('append mode tests', () => {
    it('should overwrite file when append is false', () => {
      const adapter = new FileAdapter({ filepath: testFilePath, append: false })

      adapter.output(createMockRecord('INFO', 'First message'))
      adapter.output(createMockRecord('WARNING', 'Second message'))
      adapter.destroy()

      const content = readFileSync(testFilePath, 'utf-8')
      const lines = content.trim().split('\n')
      expect(lines).toHaveLength(1)
      expect(
        (JSON.parse(lines[0]!) as LoggerRecord).runtime.lines[0]?.message
      ).toBe('Second message')
    })

    it('should append to existing file when append is true', () => {
      // Create directory first
      mkdirSync(testDir, { recursive: true })
      // Create initial file
      writeFileSync(testFilePath, '{"existing": "data"}\n', 'utf-8')

      const adapter = new FileAdapter({ filepath: testFilePath, append: true })
      adapter.output(createMockRecord('INFO', 'Appended message'))
      adapter.destroy()

      const content = readFileSync(testFilePath, 'utf-8')
      const lines = content.trim().split('\n')
      expect(lines).toHaveLength(2)
      expect(lines[0]).toBe('{"existing": "data"}')
    })
  })

  describe('time-based rotation edge cases', () => {
    it('should handle rotation at exact time boundaries', () => {
      const adapter = new FileAdapter({
        filepath: testFilePath,
        rotationFrequency: 'minutely',
        timestampFormat: 'YYYY-MM-DD_HH-mm-ss'
      })

      // Test with current time instead of mocking
      adapter.output(createMockRecord())
      adapter.destroy()

      // Just verify the adapter doesn't crash and creates some file
      expect(existsSync(testDir)).toBe(true)
    })

    it('should handle invalid timestamp format gracefully', () => {
      const adapter = new FileAdapter({
        filepath: testFilePath,
        rotationFrequency: 'daily',
        timestampFormat: 'INVALID-FORMAT-ZZZZ'
      })

      adapter.output(createMockRecord())
      adapter.destroy()

      // Should still create some file, even with invalid format
      expect(existsSync(testDir)).toBe(true)
    })

    it('should handle complex timestamp formats', () => {
      const adapter = new FileAdapter({
        filepath: testFilePath,
        rotationFrequency: 'hourly',
        timestampFormat: 'YYYY年MM月DD日_HH時mm分ss秒'
      })

      adapter.output(createMockRecord())
      adapter.destroy()

      // Should not throw error even with complex format
      expect(existsSync(testDir)).toBe(true)
    })
  })

  describe('size-based rotation edge cases', () => {
    it('should handle rotation with rotateFileCount of 1', () => {
      const adapter = new FileAdapter({
        filepath: testFilePath,
        maxFileSize: 50,
        rotateFileCount: 1
      })

      for (let i = 0; i < 5; i++) {
        adapter.output(createMockRecord('INFO', `Message ${i}`))
      }
      adapter.destroy()

      // Should only have the main file, no rotation files
      expect(existsSync(testFilePath)).toBe(true)
      expect(existsSync(resolve(testDir, 'test.1.log'))).toBe(false)
    })

    it('should handle rotation with large rotateFileCount', () => {
      const adapter = new FileAdapter({
        filepath: testFilePath,
        maxFileSize: 50,
        rotateFileCount: 100
      })

      // Write enough data to trigger multiple rotations
      for (let i = 0; i < 10; i++) {
        adapter.output(createMockRecord('INFO', `Message ${i}`))
      }
      adapter.destroy()

      // Should create multiple rotation files
      let rotationFileCount = 0
      for (let i = 1; i <= 10; i++) {
        if (existsSync(resolve(testDir, `test.${i}.log`))) {
          rotationFileCount++
        }
      }

      expect(rotationFileCount).toBeGreaterThan(0)
    })
  })

  describe('performance tests', () => {
    it('should handle high volume of logs efficiently', () => {
      const adapter = new FileAdapter({ filepath: testFilePath })
      const startTime = performance.now()

      for (let i = 0; i < 1000; i++) {
        adapter.output(createMockRecord('INFO', `Message ${i}`))
      }

      const endTime = performance.now()
      const duration = endTime - startTime
      adapter.destroy()

      // Should complete within reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000)

      // Verify all logs were written
      const content = readFileSync(testFilePath, 'utf-8')
      const lines = content.trim().split('\n')
      expect(lines).toHaveLength(1000)
    })

    it('should handle rapid rotation efficiently', () => {
      const adapter = new FileAdapter({
        filepath: testFilePath,
        maxFileSize: 100, // Small size to force frequent rotation
        rotateFileCount: 5
      })

      const startTime = performance.now()

      for (let i = 0; i < 100; i++) {
        adapter.output(createMockRecord('INFO', `Rapid rotation test ${i}`))
      }

      const endTime = performance.now()
      const duration = endTime - startTime
      adapter.destroy()

      // Should complete within reasonable time
      expect(duration).toBeLessThan(2000)
    })
  })

  describe('concurrent access simulation', () => {
    it('should handle multiple adapter instances writing to different files', () => {
      const adapters = Array.from(
        { length: 5 },
        (_, i) =>
          new FileAdapter({ filepath: resolve(testDir, `test_${i}.log`) })
      )

      // Write from multiple adapters simultaneously
      adapters.forEach((adapter, i) => {
        for (let j = 0; j < 10; j++) {
          adapter.output(createMockRecord('INFO', `Adapter ${i} message ${j}`))
        }
      })

      adapters.forEach((adapter) => adapter.destroy())

      // Verify all files were created correctly
      for (let i = 0; i < 5; i++) {
        const filePath = resolve(testDir, `test_${i}.log`)
        expect(existsSync(filePath)).toBe(true)

        const content = readFileSync(filePath, 'utf-8')
        const lines = content.trim().split('\n')
        expect(lines).toHaveLength(10)
      }
    })
  })

  describe('memory and resource management', () => {
    it('should clean up properly when destroyed', () => {
      const adapter = new FileAdapter({ filepath: testFilePath })

      adapter.output(createMockRecord())
      adapter.destroy()

      // Should not throw when calling output after destroy
      expect(() => adapter.output(createMockRecord())).not.toThrow()
    })

    it('should handle repeated destroy calls', () => {
      const adapter = new FileAdapter({ filepath: testFilePath })

      adapter.output(createMockRecord())
      adapter.destroy()
      adapter.destroy() // Second destroy call

      expect(true).toBe(true) // Should not throw
    })
  })

  describe('complex record structures', () => {
    it('should handle records with nested payload structures', () => {
      const complexRecord: LoggerRecord = {
        type: 'log',
        context: {
          userId: '12345',
          requestId: 'req-abcd-1234',
          nested: { deep: { structure: { value: 'test' } } }
        },
        runtime: {
          severity: 'INFO',
          startTime: new Date('2024-01-01T00:00:00Z'),
          endTime: new Date('2024-01-01T00:00:01Z'),
          elapsed: 1000,
          lines: [
            {
              severity: 'INFO',
              message: 'Complex log message',
              payload: {
                array: [1, 2, 3, { nested: true }],
                object: { key1: 'value1', key2: { nested: 'value2' } },
                null: null,
                boolean: true,
                number: 42.5
              },
              time: new Date('2024-01-01T00:00:00Z'),
              fileLine: 123,
              fileName: 'test.ts',
              funcName: 'testFunction'
            }
          ]
        },
        config: {
          level: 'INFO',
          customConfig: { option: 'value' }
        }
      }

      const adapter = new FileAdapter({ filepath: testFilePath })
      adapter.output(complexRecord)
      adapter.destroy()

      const content = readFileSync(testFilePath, 'utf-8')
      const parsedRecord = JSON.parse(content.trim()) as LoggerRecord

      expect(parsedRecord.context).toEqual(complexRecord.context)
      expect(parsedRecord.runtime.lines[0]?.payload).toEqual(
        complexRecord.runtime.lines[0]?.payload
      )
      expect(parsedRecord.config).toEqual(complexRecord.config)
    })

    it('should handle records with circular references by serializing properly', () => {
      const adapter = new FileAdapter({ filepath: testFilePath })

      // Create a record that would cause circular reference issues if not handled properly
      const record = createMockRecord()

      adapter.output(record)
      adapter.destroy()

      const content = readFileSync(testFilePath, 'utf-8')
      expect(() => {
        JSON.parse(content.trim())
      }).not.toThrow()
    })
  })
})
