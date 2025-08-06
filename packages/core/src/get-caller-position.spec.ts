import { describe, it, expect, beforeEach, vi } from 'vitest'
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
    })

    describe('正常なスタックトレース解析', () => {
      describe('標準的なNode.jsスタックトレースが存在する場合', () => {
        it.todo('ファイル名と行番号のタプルが返される')
      })

      describe('関数呼び出しのスタックトレース形式', () => {
        it.todo('at function (file:line:column) 形式を正しく解析する')
      })

      describe('直接呼び出しのスタックトレース形式', () => {
        it.todo('at file:line:column 形式を正しく解析する')
      })
    })

    describe('内部ファイルのスキップ', () => {
      describe('logger.tsからの呼び出し', () => {
        it.todo('logger.ts以外の実際の呼び出し元が返される')
      })

      describe('node_modulesからの呼び出し', () => {
        it.todo('node_modules以外の実際の呼び出し元が返される')
      })
    })

    describe('エラーケース', () => {
      describe('スタックトレースが存在しない場合', () => {
        it.todo('[null, null]が返される')
      })

      describe('スタックトレースが空文字列の場合', () => {
        it.todo('[null, null]が返される')
      })

      describe('有効な呼び出し元が見つからない場合', () => {
        it.todo('[null, null]が返される')
      })

      describe('正規表現にマッチしないスタックトレース形式', () => {
        it.todo('[null, null]が返される')
      })
    })

    describe('境界値テスト', () => {
      describe('スタックトレースの行数が3行未満の場合', () => {
        it.todo('[null, null]が返される')
      })

      describe('スタックトレースの行数が7行以上の場合', () => {
        it.todo('3-6行目の範囲内で有効な呼び出し元が検索される')
      })
    })

    describe('実際の使用シナリオ', () => {
      describe('debug()メソッド呼び出し時', () => {
        it.todo('正確な呼び出し元のファイル名と行番号が記録される')
      })

      describe('info()メソッド呼び出し時', () => {
        it.todo('正確な呼び出し元のファイル名と行番号が記録される')
      })

      describe('入れ子関数からの呼び出し時', () => {
        it.todo('最初の非logger.tsファイルの位置が記録される')
      })
    })
  })
})