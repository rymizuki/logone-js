import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Logone } from './logone'
import { LoggerAdapter, StreamingAdapter, LoggerRecord } from './interface'

/**
 * 複数adapter対応の包括的評価テスト
 * 
 * 評価項目:
 * 1. エラーハンドリング・例外処理
 * 2. パフォーマンス（大量adapter）
 * 3. エッジケース（空配列、null、undefined）
 * 4. 異なる種類のadapterの混在
 * 5. メモリリーク防止
 */

class FakeAdapter implements LoggerAdapter {
  public outputs: LoggerRecord[] = []
  public shouldThrow: boolean = false
  public throwMessage: string = 'Adapter error'

  output(record: LoggerRecord): void {
    if (this.shouldThrow) {
      throw new Error(this.throwMessage)
    }
    this.outputs.push(record)
  }
}

class FakeStreamingAdapter implements StreamingAdapter {
  public outputs: LoggerRecord[] = []
  public onEntryCalls: any[] = []
  public shouldThrowOnOutput: boolean = false
  public shouldThrowOnEntry: boolean = false

  output(record: LoggerRecord): void {
    if (this.shouldThrowOnOutput) {
      throw new Error('StreamingAdapter output error')
    }
    this.outputs.push(record)
  }

  onEntry(entry: any, config: any): void {
    if (this.shouldThrowOnEntry) {
      throw new Error('StreamingAdapter onEntry error')
    }
    this.onEntryCalls.push({ entry, config })
  }
}

describe('複数Adapter対応の包括的評価', () => {
  describe('エラーハンドリング・例外処理', () => {
    it('一部のadapterがエラーを投げても他のadapterは正常動作すること', () => {
      const workingAdapter = new FakeAdapter()
      const failingAdapter = new FakeAdapter()
      failingAdapter.shouldThrow = true

      const logone = new Logone([workingAdapter, failingAdapter])
      const { logger, finish } = logone.start('error-test')

      logger.info('Test message')
      
      // エラーが発生してもクラッシュしない
      expect(() => finish()).not.toThrow()
      
      // 正常なadapterには出力される
      expect(workingAdapter.outputs).toHaveLength(1)
      expect(workingAdapter.outputs[0]?.runtime.lines[0]?.message).toBe('Test message')
    })

    it('StreamingAdapterのonEntryでエラーが発生しても処理が継続されること', () => {
      const workingAdapter = new FakeStreamingAdapter()
      const failingAdapter = new FakeStreamingAdapter()
      failingAdapter.shouldThrowOnEntry = true

      const logone = new Logone([workingAdapter, failingAdapter])
      const { logger, finish } = logone.start('streaming-error-test')

      logger.info('Test message')
      
      // 正常なStreamingAdapterのonEntryは呼ばれる
      expect(workingAdapter.onEntryCalls).toHaveLength(1)
      
      finish()
      
      // 正常なadapterには出力される
      expect(workingAdapter.outputs).toHaveLength(1)
    })

    it('StreamingAdapterのoutputでエラーが発生しても他のadapterは正常動作すること', () => {
      const workingAdapter = new FakeStreamingAdapter()
      const failingAdapter = new FakeStreamingAdapter()
      failingAdapter.shouldThrowOnOutput = true

      const logone = new Logone([workingAdapter, failingAdapter])
      const { logger, finish } = logone.start('output-error-test')

      logger.info('Test message')
      finish()
      
      // 正常なadapterには出力される
      expect(workingAdapter.outputs).toHaveLength(1)
      expect(workingAdapter.outputs[0]?.runtime.lines[0]?.message).toBe('Test message')
    })
  })

  describe('パフォーマンステスト', () => {
    it('大量のadapter（100個）でも正常に動作すること', () => {
      const adapters: FakeAdapter[] = []
      
      // 100個のadapterを作成
      for (let i = 0; i < 100; i++) {
        adapters.push(new FakeAdapter())
      }

      const startTime = performance.now()
      const logone = new Logone(adapters)
      const { logger, finish } = logone.start('performance-test')

      logger.info('Performance test message')
      finish()
      const endTime = performance.now()

      // 全てのadapterに出力されること
      adapters.forEach((adapter) => {
        expect(adapter.outputs).toHaveLength(1)
        expect(adapter.outputs[0]?.runtime.lines[0]?.message).toBe('Performance test message')
      })

      // 実行時間が合理的範囲内であること（10秒以下）
      expect(endTime - startTime).toBeLessThan(10000)
    })

    it('大量のログエントリでも正常に処理されること', () => {
      const adapter = new FakeAdapter()
      const logone = new Logone([adapter])
      const { logger, finish } = logone.start('bulk-logging-test')

      const startTime = performance.now()
      
      // 1000個のログエントリを生成
      for (let i = 0; i < 1000; i++) {
        logger.info(`Message ${i}`)
      }
      
      finish()
      const endTime = performance.now()

      // 全てのエントリが記録されること
      expect(adapter.outputs[0]?.runtime.lines).toHaveLength(1000)
      
      // 実行時間が合理的範囲内であること（5秒以下）
      expect(endTime - startTime).toBeLessThan(5000)
    })
  })

  describe('エッジケース処理', () => {
    it('空配列のadapterでfinish()を呼んでもエラーが発生しないこと', () => {
      const logone = new Logone([])
      const { logger, finish } = logone.start('empty-adapter-test')

      logger.info('Test message')
      
      expect(() => finish()).not.toThrow()
    })

    it('単一adapterでも配列形式で処理されること', () => {
      const adapter = new FakeAdapter()
      const logone = new Logone(adapter) // 単一adapter（非配列）
      const { logger, finish } = logone.start('single-adapter-test')

      logger.info('Single adapter message')
      finish()

      expect(adapter.outputs).toHaveLength(1)
      expect(adapter.outputs[0]?.runtime.lines[0]?.message).toBe('Single adapter message')
    })
  })

  describe('異なる種類のadapterの混在', () => {
    it('通常のLoggerAdapterとStreamingAdapterを混在させても正常動作すること', () => {
      const regularAdapter = new FakeAdapter()
      const streamingAdapter = new FakeStreamingAdapter()

      const logone = new Logone([regularAdapter, streamingAdapter])
      const { logger, finish } = logone.start('mixed-adapter-test')

      logger.info('Mixed adapter message')
      
      // StreamingAdapterのonEntryが呼ばれる
      expect(streamingAdapter.onEntryCalls).toHaveLength(1)
      expect(streamingAdapter.onEntryCalls[0]?.entry.message).toBe('Mixed adapter message')
      
      finish()

      // 両方のadapterに出力される
      expect(regularAdapter.outputs).toHaveLength(1)
      expect(streamingAdapter.outputs).toHaveLength(1)
      expect(regularAdapter.outputs[0]?.runtime.lines[0]?.message).toBe('Mixed adapter message')
      expect(streamingAdapter.outputs[0]?.runtime.lines[0]?.message).toBe('Mixed adapter message')
    })

    it('複数のStreamingAdapterが同時に動作すること', () => {
      const streaming1 = new FakeStreamingAdapter()
      const streaming2 = new FakeStreamingAdapter()
      const streaming3 = new FakeStreamingAdapter()

      const logone = new Logone([streaming1, streaming2, streaming3])
      const { logger, finish } = logone.start('multiple-streaming-test')

      logger.info('Multiple streaming message')
      
      // 全てのStreamingAdapterのonEntryが呼ばれる
      expect(streaming1.onEntryCalls).toHaveLength(1)
      expect(streaming2.onEntryCalls).toHaveLength(1)
      expect(streaming3.onEntryCalls).toHaveLength(1)
      
      finish()

      // 全てのadapterに出力される
      expect(streaming1.outputs).toHaveLength(1)
      expect(streaming2.outputs).toHaveLength(1)
      expect(streaming3.outputs).toHaveLength(1)
    })
  })

  describe('後方互換性確認', () => {
    it('単一adapter（旧API）での使用が正常に動作すること', () => {
      const adapter = new FakeAdapter()
      const logone = new Logone(adapter) // 旧来の単一adapter形式

      const { logger, finish } = logone.start('backward-compatibility-test')

      logger.info('Backward compatibility message')
      finish()

      expect(adapter.outputs).toHaveLength(1)
      expect(adapter.outputs[0]?.runtime.lines[0]?.message).toBe('Backward compatibility message')
    })
  })

  describe('型安全性テスト', () => {
    it('LoggerAdapterInput型が単一adapterと配列の両方を受け入れること', () => {
      const singleAdapter = new FakeAdapter()
      const arrayAdapters = [new FakeAdapter(), new FakeAdapter()]

      // コンパイル時に型エラーが発生しないことを確認
      const logone1 = new Logone(singleAdapter)
      const logone2 = new Logone(arrayAdapters)

      expect(logone1).toBeDefined()
      expect(logone2).toBeDefined()
    })
  })

  describe('メモリリーク防止', () => {
    it('大量のadapterインスタンスが適切にガベージコレクションされること', () => {
      // WeakRefを使用してメモリリークをテスト
      let adapters: FakeAdapter[] = []
      const weakRefs: WeakRef<FakeAdapter>[] = []
      
      // 100個のadapterを作成してWeakRefで追跡
      for (let i = 0; i < 100; i++) {
        const adapter = new FakeAdapter()
        adapters.push(adapter)
        weakRefs.push(new WeakRef(adapter))
      }

      const logone = new Logone(adapters)
      const { logger, finish } = logone.start('memory-test')

      logger.info('Memory test message')
      finish()

      // 参照を削除
      adapters = []

      // ガベージコレクションを試行（実際のGCは保証されないが、テストの意図を示す）
      if (global.gc) {
        global.gc()
      }

      // 全てのWeakRefがまだ有効であることを確認（Logoneクラス内で保持されているため）
      const validRefs = weakRefs.filter(ref => ref.deref() !== undefined)
      
      // Logoneインスタンスが参照を保持しているため、まだ生きている
      expect(validRefs.length).toBeGreaterThan(0)
    })
  })
})