import { LoggerAdapter, LoggerRecord } from './types'
import { mkdirSync, writeFileSync, appendFileSync, existsSync, statSync } from 'fs'
import { dirname, resolve } from 'path'

interface FileAdapterOptions {
  filepath: string
  maxFileSize?: number
  rotateFileCount?: number
  append?: boolean
  encoding?: BufferEncoding
}

export class FileAdapter implements LoggerAdapter {
  private fileIndex = 0
  private readonly options: Required<FileAdapterOptions>

  constructor(options: FileAdapterOptions) {
    this.options = {
      filepath: options.filepath,
      maxFileSize: options.maxFileSize ?? Infinity,
      rotateFileCount: options.rotateFileCount ?? 5,
      append: options.append ?? true,
      encoding: options.encoding ?? 'utf-8'
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

  private write(content: string): void {
    const filepath = this.getCurrentFilePath()
    const dir = dirname(filepath)
    
    mkdirSync(dir, { recursive: true })
    
    if (this.options.append && existsSync(filepath)) {
      appendFileSync(filepath, content, { encoding: this.options.encoding })
    } else {
      writeFileSync(filepath, content, { encoding: this.options.encoding })
    }
  }

  private shouldRotate(nextContentSize: number): boolean {
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

  private rotateFile(): void {
    this.fileIndex = (this.fileIndex + 1) % this.options.rotateFileCount
  }

  private initializeFile(): void {
    const filepath = this.getCurrentFilePath()
    const dir = dirname(filepath)
    
    mkdirSync(dir, { recursive: true })
  }

  private getCurrentFilePath(): string {
    if (this.fileIndex === 0) {
      return resolve(this.options.filepath)
    }
    const dir = dirname(this.options.filepath)
    const filename = this.options.filepath.split('/').pop() ?? 'logone.log'
    const [name, ext] = filename.includes('.') 
      ? filename.split(/\.(?=[^.]+$)/) 
      : [filename, 'log']
    return resolve(dir, `${name}.${this.fileIndex}.${ext}`)
  }

  destroy(): void {
    // 同期実装では特にクリーンアップ処理は不要
  }
}

export function createAdapter(options: FileAdapterOptions): FileAdapter {
  return new FileAdapter(options)
}