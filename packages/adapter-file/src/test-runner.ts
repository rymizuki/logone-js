#!/usr/bin/env node

import { FileAdapter } from './file-adapter'
import { LoggerRecord } from './types'
import { readFileSync, existsSync, rmSync } from 'fs'
import { resolve } from 'path'

const testDir = resolve(__dirname, '../test-output')
const testFilePath = resolve(testDir, 'test.log')

// テストヘルパー
function createMockRecord(severity: any = 'INFO'): LoggerRecord {
  return {
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
  }
}

function cleanup() {
  if (existsSync(testDir)) {
    rmSync(testDir, { recursive: true, force: true })
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ ${message}`)
  }
  console.log(`✅ ${message}`)
}

// テスト実行
async function runTests() {
  console.log('🧪 FileAdapter テスト開始\n')
  
  // テスト1: 基本的な書き込み
  cleanup()
  const adapter = new FileAdapter({ filepath: testFilePath })
  const record = createMockRecord()
  
  adapter.output(record)
  adapter.destroy()
  
  assert(existsSync(testFilePath), 'ファイルが作成されること')
  
  const content = readFileSync(testFilePath, 'utf-8')
  const parsedRecord = JSON.parse(content.trim())
  
  assert(parsedRecord.type === 'log', 'レコードタイプが正しいこと')
  assert(parsedRecord.runtime.severity === 'INFO', 'severityが正しいこと')
  
  // テスト2: 複数レコードの追記
  cleanup()
  const adapter2 = new FileAdapter({ filepath: testFilePath })
  
  adapter2.output(createMockRecord('INFO'))
  adapter2.output(createMockRecord('ERROR'))
  adapter2.destroy()
  
  const content2 = readFileSync(testFilePath, 'utf-8')
  const lines = content2.trim().split('\n')
  
  assert(lines.length === 2, '2つのレコードが書き込まれること')
  assert(JSON.parse(lines[0]!).runtime.severity === 'INFO', '1つ目のレコードが正しいこと')
  assert(JSON.parse(lines[1]!).runtime.severity === 'ERROR', '2つ目のレコードが正しいこと')
  
  // テスト3: ファイルローテーション
  cleanup()
  const adapter3 = new FileAdapter({ 
    filepath: testFilePath,
    maxFileSize: 100,
    rotateFileCount: 3
  })
  
  const largeRecord = createMockRecord()
  adapter3.output(largeRecord)
  adapter3.output(largeRecord)
  adapter3.destroy()
  
  const rotatedFile = resolve(testDir, 'test.1.log')
  assert(existsSync(rotatedFile), 'ローテーションファイルが作成されること')
  
  cleanup()
  console.log('\n🎉 全てのテストが成功しました！')
}

runTests().catch(error => {
  console.error('❌ テストエラー:', error.message)
  process.exit(1)
})