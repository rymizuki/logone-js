# @logone/adapter-file

ファイルにログを出力するためのLogoneアダプターです。

## 機能

- ファイルへのログ出力
- ファイルローテーション機能
- カスタマイズ可能な出力フォーマット
- エンコーディング指定

## インストール

```bash
npm install @logone/adapter-file
```

## 使用方法

### 基本的な使用方法

```typescript
import { createAdapter } from '@logone/adapter-file'
import { createLogger } from '@logone/core'

const adapter = createAdapter({
  filepath: './logs/app.log'
})

const logger = createLogger({
  adapters: adapter
})

logger.info('Hello, world!')
```

### ファイルローテーション

```typescript
const adapter = createAdapter({
  filepath: './logs/app.log',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  rotateFileCount: 5 // app.log, app.1.log, app.2.log, app.3.log, app.4.log
})
```

### オプション設定

```typescript
const adapter = createAdapter({
  filepath: './logs/app.log',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  rotateFileCount: 3,
  append: true, // ファイルに追記 (デフォルト: true)
  encoding: 'utf-8' // エンコーディング (デフォルト: 'utf-8')
})
```

## API

### FileAdapterOptions

| プロパティ | 型 | デフォルト値 | 説明 |
|-----------|----|----|------|
| `filepath` | `string` | - | 出力先ファイルパス (必須) |
| `maxFileSize` | `number` | `Infinity` | ファイルの最大サイズ (バイト) |
| `rotateFileCount` | `number` | `5` | ローテーションするファイル数 |
| `append` | `boolean` | `true` | ファイルに追記するかどうか |
| `encoding` | `BufferEncoding` | `'utf-8'` | ファイルエンコーディング |

## ファイルローテーション

`maxFileSize`を指定すると、ファイルサイズがその値を超えた時に自動的にファイルがローテーションされます。

例：`app.log`が5MBに達した場合
- `app.log` → `app.1.log`にリネーム
- 新しい`app.log`を作成

`rotateFileCount`で保持するファイル数を指定できます。古いファイルは自動的に削除されます。