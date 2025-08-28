import { LoggerAdapter, LoggerRecord } from '@logone/core'
import { mkdirSync, writeFileSync, appendFileSync, existsSync, statSync } from 'fs'
import { dirname, resolve, basename, extname } from 'path'

type RotationFrequency = 'daily' | 'hourly' | 'minutely'

interface FileAdapterOptions {
  filepath: string
  maxFileSize?: number
  rotateFileCount?: number
  append?: boolean
  encoding?: BufferEncoding
  rotationFrequency?: RotationFrequency
  timestampFormat?: string
}

interface InternalFileAdapterOptions {
  filepath: string
  maxFileSize: number
  rotateFileCount: number
  append: boolean
  encoding: BufferEncoding
  rotationFrequency?: RotationFrequency
  timestampFormat: string
}

export class FileAdapter implements LoggerAdapter {
  private fileIndex = 0
  private lastRotationTime?: Date
  private readonly options: InternalFileAdapterOptions

  constructor(options: FileAdapterOptions) {
    this.validateOptions(options)
    this.options = {
      filepath: options.filepath,
      maxFileSize: options.maxFileSize ?? Infinity,
      rotateFileCount: options.rotateFileCount ?? 5,
      append: options.append ?? true,
      encoding: options.encoding ?? 'utf-8',
      rotationFrequency: options.rotationFrequency,
      timestampFormat: options.timestampFormat ?? 'YYYY-MM-DD'
    }
    this.initializeFile()
  }

  output(record: LoggerRecord): void {
    const content = this.format(record)
    const contentSize = Buffer.byteLength(content, this.options.encoding)

    if (this.shouldRotate(contentSize)) {
      this.rotateFile()
    }

    this.write(content)
  }

  private format(record: LoggerRecord): string {
    return `${JSON.stringify(record)}\n`
  }

  private validateOptions(options: FileAdapterOptions): void {
    if (!options.filepath?.trim()) {
      throw new Error('filepath is required')
    }
    
    if (options.maxFileSize !== undefined && options.maxFileSize <= 0) {
      throw new Error('maxFileSize must be greater than 0')
    }
    
    if (options.rotateFileCount !== undefined && options.rotateFileCount <= 0) {
      throw new Error('rotateFileCount must be greater than 0')
    }
  }

  private write(content: string): void {
    try {
      const filepath = this.getCurrentFilePath()
      const dir = dirname(filepath)
      
      mkdirSync(dir, { recursive: true })
      
      if (this.options.append && existsSync(filepath)) {
        appendFileSync(filepath, content, { encoding: this.options.encoding })
      } else {
        writeFileSync(filepath, content, { encoding: this.options.encoding })
      }
    } catch (error) {
      console.error(`Failed to write log to file: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  private getFilenameComponents(filepath: string): { name: string, ext: string } {
    const filename = basename(filepath)
    const ext = extname(filename).slice(1) || 'log'
    const name = basename(filename, '.' + ext)
    return { name, ext }
  }

  private shouldRotate(nextContentSize: number): boolean {
    // 時間ベースローテーションのチェック
    if (this.options.rotationFrequency && this.shouldRotateByTime()) {
      return true
    }
    
    // サイズベースローテーションのチェック
    if (this.options.maxFileSize === Infinity) {
      return false
    }
    
    const filepath = this.getCurrentFilePath()
    let currentSize = 0
    
    if (existsSync(filepath)) {
      currentSize = statSync(filepath).size
    }
    
    return currentSize + nextContentSize > this.options.maxFileSize
  }

  private shouldRotateByTime(): boolean {
    const now = new Date()
    
    if (!this.lastRotationTime) {
      this.lastRotationTime = now
      return false
    }
    
    switch (this.options.rotationFrequency) {
      case 'minutely':
        return now.getMinutes() !== this.lastRotationTime.getMinutes() ||
               now.getHours() !== this.lastRotationTime.getHours() ||
               now.getDate() !== this.lastRotationTime.getDate()
      case 'hourly':
        return now.getHours() !== this.lastRotationTime.getHours() ||
               now.getDate() !== this.lastRotationTime.getDate()
      case 'daily':
        return now.getDate() !== this.lastRotationTime.getDate() ||
               now.getMonth() !== this.lastRotationTime.getMonth() ||
               now.getFullYear() !== this.lastRotationTime.getFullYear()
      default:
        return false
    }
  }

  private rotateFile(): void {
    if (this.options.rotationFrequency) {
      // 時間ベースローテーションでは lastRotationTime を更新
      this.lastRotationTime = new Date()
    } else {
      // サイズベースローテーションでは fileIndex を更新
      this.fileIndex = (this.fileIndex + 1) % this.options.rotateFileCount
    }
  }

  private initializeFile(): void {
    const filepath = this.getCurrentFilePath()
    const dir = dirname(filepath)
    
    mkdirSync(dir, { recursive: true })
  }

  private getCurrentFilePath(): string {
    if (this.options.rotationFrequency) {
      return this.getTimeBasedFilePath()
    }
    
    if (this.fileIndex === 0) {
      return resolve(this.options.filepath)
    }
    
    const dir = dirname(this.options.filepath)
    const { name, ext } = this.getFilenameComponents(this.options.filepath)
    return resolve(dir, `${name}.${this.fileIndex}.${ext}`)
  }

  private getTimeBasedFilePath(): string {
    const dir = dirname(this.options.filepath)
    const { name, ext } = this.getFilenameComponents(this.options.filepath)
    
    const timestamp = this.formatTimestamp(new Date())
    return resolve(dir, `${name}.${timestamp}.${ext}`)
  }

  private formatTimestamp(date: Date): string {
    const format = this.options.timestampFormat
    
    // シンプルな置換ベースの実装
    return format
      .replace('YYYY', date.getFullYear().toString())
      .replace('MM', (date.getMonth() + 1).toString().padStart(2, '0'))
      .replace('DD', date.getDate().toString().padStart(2, '0'))
      .replace('HH', date.getHours().toString().padStart(2, '0'))
      .replace('mm', date.getMinutes().toString().padStart(2, '0'))
      .replace('ss', date.getSeconds().toString().padStart(2, '0'))
  }

  destroy(): void {
    // 同期実装では特にクリーンアップ処理は不要
  }
}

export function createAdapter(options: FileAdapterOptions): FileAdapter {
  return new FileAdapter(options)
}