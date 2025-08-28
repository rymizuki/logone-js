# @logone/adapter-file

A Logone adapter for outputting logs to files with rotation capabilities.

## Features

- File log output with JSON format
- File rotation (size-based and time-based)
- Customizable output format
- Multiple encoding support
- Timestamp-based file naming

## Installation

```bash
npm install @logone/adapter-file
```

## Usage

### Basic Usage

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

### File Rotation

#### Size-based Rotation

```typescript
const adapter = createAdapter({
  filepath: './logs/app.log',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  rotateFileCount: 5 // app.log, app.1.log, app.2.log, app.3.log, app.4.log
})
```

#### Time-based Rotation

```typescript
// Daily rotation
const dailyAdapter = createAdapter({
  filepath: './logs/app.log',
  rotationFrequency: 'daily',
  timestampFormat: 'YYYY-MM-DD' // app.2024-01-15.log
})

// Hourly rotation
const hourlyAdapter = createAdapter({
  filepath: './logs/app.log',
  rotationFrequency: 'hourly',
  timestampFormat: 'YYYY-MM-DD_HH' // app.2024-01-15_14.log
})

// Minutely rotation
const minutelyAdapter = createAdapter({
  filepath: './logs/app.log',
  rotationFrequency: 'minutely',
  timestampFormat: 'YYYY-MM-DD_HH-mm' // app.2024-01-15_14-30.log
})
```

### Configuration Options

```typescript
const adapter = createAdapter({
  filepath: './logs/app.log',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  rotateFileCount: 3,
  append: true, // Append to file (default: true)
  encoding: 'utf-8' // File encoding (default: 'utf-8')
})
```

## API

### FileAdapterOptions

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `filepath` | `string` | - | Output file path (required) |
| `maxFileSize` | `number` | `Infinity` | Maximum file size in bytes |
| `rotateFileCount` | `number` | `5` | Number of rotation files to keep |
| `append` | `boolean` | `true` | Whether to append to existing file |
| `encoding` | `BufferEncoding` | `'utf-8'` | File encoding |
| `rotationFrequency` | `'daily' \| 'hourly' \| 'minutely'` | `undefined` | Time-based rotation frequency |
| `timestampFormat` | `string` | `'YYYY-MM-DD'` | Timestamp format pattern |

## Rotation Strategies

### Size-based Rotation

When `maxFileSize` is specified, files are automatically rotated when they exceed the specified size.

Example: When `app.log` reaches 5MB:
- `app.log` → renamed to `app.1.log`
- New `app.log` is created

Use `rotateFileCount` to specify the number of files to keep. Older files are automatically deleted.

### Time-based Rotation

When `rotationFrequency` is specified, new files are created at specified intervals:

- `daily`: Daily rotation (new file when date changes)
- `hourly`: Hourly rotation (new file when hour changes)
- `minutely`: Minutely rotation (new file when minute changes)

### Timestamp Format

Available format tokens for time-based rotation:

- `YYYY`: Year (4 digits)
- `MM`: Month (2 digits, zero-padded)
- `DD`: Day (2 digits, zero-padded)
- `HH`: Hour (2 digits, zero-padded, 24-hour format)
- `mm`: Minute (2 digits, zero-padded)
- `ss`: Second (2 digits, zero-padded)