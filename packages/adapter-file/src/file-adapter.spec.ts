import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { FileAdapter, createAdapter } from './file-adapter'
import { LoggerRecord } from './types'
import { readFileSync, existsSync, rmSync } from 'fs'
import { resolve } from 'path'

describe('FileAdapter', () => {
  const testDir = resolve(__dirname, '../test-output')
  const testFilePath = resolve(testDir, 'test.log')

  beforeEach(() => {
    vi.clearAllMocks()
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  const createMockRecord = (severity = 'INFO' as any): LoggerRecord => ({
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
          message: 'Test message',
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

  describe('constructor', () => {
    it('should initialize with required options', () => {
      const adapter = new FileAdapter({ filepath: testFilePath })
      expect(adapter).toBeInstanceOf(FileAdapter)
      adapter.destroy()
    })

    it('should create directory if it does not exist', () => {
      const adapter = new FileAdapter({ filepath: testFilePath })
      adapter.output(createMockRecord())
      expect(existsSync(testDir)).toBe(true)
      adapter.destroy()
    })
  })

  describe('output', () => {
    it('should write log records to file', () => {
      const adapter = new FileAdapter({ filepath: testFilePath })
      const record = createMockRecord()
      
      adapter.output(record)
      adapter.destroy()
      
      const content = readFileSync(testFilePath, 'utf-8')
      const parsedRecord = JSON.parse(content.trim())
      
      expect(parsedRecord).toMatchObject({
        type: 'log',
        runtime: {
          severity: 'INFO'
        }
      })
    })

    it('should append multiple records', () => {
      const adapter = new FileAdapter({ filepath: testFilePath })
      
      adapter.output(createMockRecord('INFO'))
      adapter.output(createMockRecord('ERROR'))
      adapter.destroy()
      
      const content = readFileSync(testFilePath, 'utf-8')
      const lines = content.trim().split('\n')
      
      expect(lines).toHaveLength(2)
      expect(JSON.parse(lines[0]!).runtime.severity).toBe('INFO')
      expect(JSON.parse(lines[1]!).runtime.severity).toBe('ERROR')
    })

    it('should handle different severities', () => {
      const adapter = new FileAdapter({ filepath: testFilePath })
      const severities = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'] as const
      
      severities.forEach(severity => {
        adapter.output(createMockRecord(severity))
      })
      adapter.destroy()
      
      const content = readFileSync(testFilePath, 'utf-8')
      const lines = content.trim().split('\n')
      
      expect(lines).toHaveLength(5)
      lines.forEach((line, index) => {
        expect(JSON.parse(line).runtime.severity).toBe(severities[index])
      })
    })
  })

  describe('file rotation', () => {
    it('should rotate files when maxFileSize is exceeded', () => {
      const adapter = new FileAdapter({ 
        filepath: testFilePath,
        maxFileSize: 100,
        rotateFileCount: 3
      })
      
      const record = createMockRecord()
      adapter.output(record)
      adapter.output(record)
      adapter.destroy()
      
      const rotatedFile = resolve(testDir, 'test.1.log')
      expect(existsSync(rotatedFile)).toBe(true)
    })

    it('should limit rotation to rotateFileCount', () => {
      const adapter = new FileAdapter({ 
        filepath: testFilePath,
        maxFileSize: 50,
        rotateFileCount: 2
      })
      
      const record = createMockRecord()
      
      for (let i = 0; i < 6; i++) {
        adapter.output(record)
      }
      adapter.destroy()
      
      expect(existsSync(resolve(testDir, 'test.log'))).toBe(true)
      expect(existsSync(resolve(testDir, 'test.1.log'))).toBe(true)
      expect(existsSync(resolve(testDir, 'test.2.log'))).toBe(false)
    })
  })

  describe('createAdapter', () => {
    it('should create a new FileAdapter instance', () => {
      const adapter = createAdapter({ filepath: testFilePath })
      expect(adapter).toBeInstanceOf(FileAdapter)
      adapter.destroy()
    })

    it('should pass options correctly', () => {
      const adapter = createAdapter({ 
        filepath: testFilePath,
        maxFileSize: 1000,
        append: false
      })
      
      adapter.output(createMockRecord())
      adapter.destroy()
      
      expect(existsSync(testFilePath)).toBe(true)
    })
  })
})