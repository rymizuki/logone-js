# @logone/adapter-file

ファイルにログを出力するためのLogoneアダプターです。

## 機能

- ファイルへのログ出力
- ファイルローテーション機能（サイズベース・時間ベース）
- カスタマイズ可能な出力フォーマット
- エンコーディング指定
- タイムスタンプベースのファイル名生成

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

#### サイズベースローテーション

```typescript
const adapter = createAdapter({
  filepath: './logs/app.log',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  rotateFileCount: 5 // app.log, app.1.log, app.2.log, app.3.log, app.4.log
})
```

#### 時間ベースローテーション

```typescript
// 日次ローテーション
const dailyAdapter = createAdapter({
  filepath: './logs/app.log',
  rotationFrequency: 'daily',
  timestampFormat: 'YYYY-MM-DD' // app.2024-01-15.log
})

// 時間単位ローテーション
const hourlyAdapter = createAdapter({
  filepath: './logs/app.log',
  rotationFrequency: 'hourly',
  timestampFormat: 'YYYY-MM-DD_HH' // app.2024-01-15_14.log
})

// 分単位ローテーション
const minutelyAdapter = createAdapter({
  filepath: './logs/app.log',
  rotationFrequency: 'minutely',
  timestampFormat: 'YYYY-MM-DD_HH-mm' // app.2024-01-15_14-30.log
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
| `rotationFrequency` | `'daily' \| 'hourly' \| 'minutely'` | `undefined` | 時間ベースローテーションの頻度 |
| `timestampFormat` | `string` | `'YYYY-MM-DD'` | タイムスタンプのフォーマット |

## ローテーション方式

### サイズベースローテーション

`maxFileSize`を指定すると、ファイルサイズがその値を超えた時に自動的にファイルがローテーションされます。

例：`app.log`が5MBに達した場合
- `app.log` → `app.1.log`にリネーム
- 新しい`app.log`を作成

`rotateFileCount`で保持するファイル数を指定できます。古いファイルは自動的に削除されます。

### 時間ベースローテーション

`rotationFrequency`を指定すると、指定した間隔で新しいファイルが作成されます。

- `daily`: 日次ローテーション（日付が変わると新しいファイル）
- `hourly`: 時間単位ローテーション（時間が変わると新しいファイル）
- `minutely`: 分単位ローテーション（分が変わると新しいファイル）

### タイムスタンプフォーマット

時間ベースローテーションで使用できるフォーマット：

- `YYYY`: 年 (4桁)
- `MM`: 月 (2桁、ゼロ埋め)
- `DD`: 日 (2桁、ゼロ埋め)
- `HH`: 時 (2桁、ゼロ埋め、24時間形式)
- `mm`: 分 (2桁、ゼロ埋め)
- `ss`: 秒 (2桁、ゼロ埋め)