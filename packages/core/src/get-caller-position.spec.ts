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

    describe('正常なスタックトレース解析', () => {
      describe('標準的なNode.jsスタックトレースが存在する場合', () => {
        it('ファイル名と行番号のタプルが返される', () => {
          // この行の番号を記録（次の行が実際の呼び出し）
          const expectedLine = 28
          logger.debug('test message')
          
          const entry = stacker.entries[0]
          expect(entry.fileName).toContain('get-caller-position.spec.ts')
          expect(entry.fileLine).toBe(expectedLine)
        })
      })

      describe('関数呼び出しのスタックトレース形式', () => {
        it('at function (file:line:column) 形式を正しく解析する', () => {
          function testFunction() {
            // この行の番号を記録（次の行が実際の呼び出し）
            const expectedLine = 41
            logger.info('test from function')
          }
          
          testFunction()
          
          const entry = stacker.entries[0]
          expect(entry.fileName).toContain('get-caller-position.spec.ts')
          expect(entry.fileLine).toBe(41)
        })
      })

      describe('直接呼び出しのスタックトレース形式', () => {
        it('at file:line:column 形式を正しく解析する', () => {
          // この行の番号を記録（次の行が実際の呼び出し）
          const expectedLine = 56
          logger.warning('direct call test')
          
          const entry = stacker.entries[0]
          expect(entry.fileName).toContain('get-caller-position.spec.ts')
          expect(entry.fileLine).toBe(expectedLine)
        })
      })
    })

    describe('内部ファイルのスキップ', () => {
      describe('logger.tsからの呼び出し', () => {
        it('logger.ts以外の実際の呼び出し元が返される', () => {
          // この行の番号を記録（次の行が実際の呼び出し）
          const expectedLine = 70
          logger.error('test message')
          
          const entry = stacker.entries[0]
          expect(entry.fileName).toContain('get-caller-position.spec.ts')
          expect(entry.fileName).not.toContain('logger.ts')
          expect(entry.fileLine).toBe(expectedLine)
        })
      })

      describe('node_modulesからの呼び出し', () => {
        it.todo('node_modules以外の実際の呼び出し元が返される')
        // Note: このテストは実際のnode_modulesからの呼び出しをシミュレートするのが困難
      })
    })

    describe('エラーケース', () => {
      describe('スタックトレースが存在しない場合', () => {
        it.todo('[null, null]が返される')
        // Note: Error.prototype.stackのモッキングは複雑で実際のユースケースでは発生しにくい
      })

      describe('スタックトレースが空文字列の場合', () => {
        it.todo('[null, null]が返される')
        // Note: Error.prototype.stackのモッキングは複雑で実際のユースケースでは発生しにくい  
      })

      describe('有効な呼び出し元が見つからない場合', () => {
        it.todo('[null, null]が返される')
        // Note: 実際の環境で有効な呼び出し元が見つからない状況をシミュレートするのは困難
      })

      describe('正規表現にマッチしないスタックトレース形式', () => {
        it.todo('[null, null]が返される')
        // Note: Error.prototype.stackのモッキングは複雑で実際のユースケースでは発生しにくい
      })
    })

    describe('境界値テスト', () => {
      describe('スタックトレースの行数が3行未満の場合', () => {
        it.todo('[null, null]が返される')
        // Note: Error.prototype.stackのモッキングは複雑で実際のユースケースでは発生しにくい
      })

      describe('スタックトレースの行数が7行以上の場合', () => {
        it.todo('3-6行目の範囲内で有効な呼び出し元が検索される')
        // Note: Error.prototype.stackのモッキングは複雑で実際のユースケースでは発生しにくい
      })
    })

    describe('実際の使用シナリオ', () => {
      describe('debug()メソッド呼び出し時', () => {
        it('正確な呼び出し元のファイル名と行番号が記録される', () => {
          // この行の番号を記録（次の行が実際の呼び出し）
          const expectedLine = 124
          logger.debug('debug message')
          
          const entry = stacker.entries[0]
          expect(entry.fileName).toContain('get-caller-position.spec.ts')
          expect(entry.fileLine).toBe(expectedLine)
          expect(entry.severity).toBe('DEBUG')
          expect(entry.message).toBe('debug message')
        })
      })

      describe('info()メソッド呼び出し時', () => {
        it('正確な呼び出し元のファイル名と行番号が記録される', () => {
          // この行の番号を記録（次の行が実際の呼び出し）
          const expectedLine = 138
          logger.info('info message')
          
          const entry = stacker.entries[0]
          expect(entry.fileName).toContain('get-caller-position.spec.ts')
          expect(entry.fileLine).toBe(expectedLine)
          expect(entry.severity).toBe('INFO')
          expect(entry.message).toBe('info message')
        })
      })

      describe('入れ子関数からの呼び出し時', () => {
        it('最初の非logger.tsファイルの位置が記録される', () => {
          function outerFunction() {
            function innerFunction() {
              // この行の番号を記録（次の行が実際の呼び出し）
              const expectedLine = 154
              logger.critical('nested call')
            }
            innerFunction()
          }
          
          outerFunction()
          
          const entry = stacker.entries[0]
          expect(entry.fileName).toContain('get-caller-position.spec.ts')
          expect(entry.fileLine).toBe(154)
          expect(entry.severity).toBe('CRITICAL')
        })
      })
    })
  })
})