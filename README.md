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

## 開発者向け

### パッケージの公開

このプロジェクトでは厳格な公開ワークフローを採用しています：

```bash
# 通常の公開（推奨）- 事前検証付き
npm run publish

# 検証のみ実行
npm run verify-publish

# 強制公開（検証をスキップ） - 緊急時のみ使用
npm run publish:force
```

**重要な仕様：**
- privateパッケージ（`@logone/dev-config`, `@logone/test-helper`）は自動的に公開対象から除外
- 公開前に対象パッケージと除外パッケージが明確に表示され、手動確認が必要
- changeset設定で明示的にprivateパッケージを除外

### 新しいパッケージの追加

1. `packages/` 配下に新しいディレクトリを作成
2. privateパッケージの場合は `package.json` で `"private": true` を設定
3. privateパッケージは `.changeset/config.json` の `ignore` リストに追加

## ライセンス

MIT