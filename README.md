# logone-js

This library is a logger that supports structured logging by generating a single line of JSON format for your specified lifecycle. Inspired by logone-go.

## パッケージ一覧

- [@logone/core](./packages/core) - コアライブラリ
- [@logone/adapter-node](./packages/adapter-node) - Node.jsコンソール出力アダプター
- [@logone/adapter-file](./packages/adapter-file) - ファイル出力アダプター
- [@logone/adapter-google-cloud-logging](./packages/adapter-google-cloud-logging) - Google Cloud Logging アダプター
- [@logone/express](./packages/express) - Express.js ミドルウェア
- [@logone/test-helper](./packages/test-helper) - テストヘルパー
- [@logone/dev-config](./packages/dev-config) - 開発設定

## クイックスタート

```bash
npm install @logone/core @logone/adapter-node
```

```typescript
import { createLogger } from '@logone/core'
import { createAdapter } from '@logone/adapter-node'

const logger = createLogger({
  adapters: createAdapter()
})

logger.info('Hello, world!')
```

## ライセンス

MIT