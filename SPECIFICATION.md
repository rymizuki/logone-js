# Logone-js Specification Document

## 1. Overview

Logone-js is a structured logging library for JavaScript/TypeScript applications that generates single-line JSON logs for specified lifecycles. It is designed to collect multiple log entries during a process and output them as a single structured JSON record when the lifecycle completes.

### Core Principles

1. **Lifecycle-based Logging**: Logs are collected during a defined lifecycle and output as a single record
2. **Structured Output**: All logs are output as single-line JSON for easy parsing and analysis
3. **Pluggable Architecture**: Support for different output destinations through adapters
4. **Security by Default**: Built-in secret masking capabilities
5. **Developer Experience**: Automatic caller position detection and TypeScript support

## 2. Architecture

### 2.1 Component Overview

```
┌─────────────┐     ┌─────────┐     ┌─────────────┐
│   Logone    │────▶│ Logger  │────▶│   Stacker   │
│ (Lifecycle) │     │ (API)   │     │ (Storage)   │
└─────────────┘     └─────────┘     └─────────────┘
       │                  │
       │                  ├──────────▶ Timer (Timing)
       │                  │
       │                  └──────────▶ getCallerPosition()
       │
       ▼
┌─────────────┐     ┌─────────────────────────────┐
│  Processor  │────▶│        Adapters             │
│  Pipeline   │     ├─────────────────────────────┤
└─────────────┘     │ NodeAdapter │ GCPAdapter   │
                    │ CustomAdapter │ ...         │
                    └─────────────────────────────┘
```

### 2.2 Core Components

#### Logone Class
- **Responsibility**: Manages logging lifecycle
- **Key Methods**:
  - `start(type: string, context?: LoggerContext)`: Begin a logging lifecycle
  - Returns `{ logger: LoggerInterface, finish: () => void }`

#### Logger Class
- **Responsibility**: Provides logging API and captures caller information
- **Key Methods**:
  - `debug(message: string, ...args: unknown[])`
  - `info(message: string, ...args: unknown[])`
  - `warning(message: string, ...args: unknown[])`
  - `error(message: string, ...args: unknown[])`
  - `critical(message: string, ...args: unknown[])`
  - `record(severity: LoggerSeverity, message: string)`

#### Timer Class
- **Responsibility**: Track timing information
- **Configuration**: `elapsedUnit` (1ms, 10ms, 100ms, 1s)

#### Stacker Class
- **Responsibility**: Store log entries during lifecycle
- **Implementation**: Simple array-based storage

## 3. Data Structures

### 3.1 LoggerRecord (Output Structure)

```typescript
interface LoggerRecord {
  type: string;              // Lifecycle type identifier
  context: LoggerContext;    // User-provided context data
  runtime: {
    severity: LoggerSeverity; // Highest severity in lifecycle
    startTime: Date;         // ISO 8601 timestamp
    endTime: Date;           // ISO 8601 timestamp
    elapsed: number;         // Duration in configured unit
    lines: LogRecord[];      // All log entries
  };
  config: {
    elapsedUnit: ElapsedUnit;
    logLevel: LoggerSeverity;
    maskKeywords: Array<string | RegExp>;
  };
}
```

### 3.2 LogRecord (Individual Entry)

```typescript
interface LogRecord {
  severity: LoggerSeverity;   // DEBUG | INFO | WARNING | ERROR | CRITICAL
  message: string;            // Log message
  payload: unknown;           // Additional data (single arg or array)
  time: Date;                 // When logged
  fileLine: number | null;    // Source line number
  fileName: string | null;    // Source file path
  funcName: string | null;    // Calling function name
  tags?: string[];            // Optional tags
  attributes?: string;        // Optional attributes
  // For ERROR/CRITICAL severity:
  error?: string;             // Error message
  stackTrace?: string[];      // Stack trace lines
}
```

### 3.3 Configuration

```typescript
interface LogoneConfig {
  elapsedUnit?: '1ms' | '10ms' | '100ms' | '1s';  // Default: '1ms'
  logLevel?: LoggerSeverity;                       // Default: 'DEBUG'
  maskKeywords?: Array<string | RegExp>;           // Default: []
}
```

## 4. Processing Pipeline

### 4.1 Log Collection Phase
1. User calls logging method (debug, info, etc.)
2. Logger captures caller position via stack trace analysis
3. Log entry created with timestamp and payload
4. Entry stored in Stacker

### 4.2 Output Processing Phase (on finish())
1. **Level Filtering**: Remove entries below configured log level
2. **Reference Handling**: Exclude circular references
3. **Type Conversion**: Convert special types (BigInt, Date, Error)
4. **Secret Masking**: Apply keyword/regex masking to payloads
5. **Severity Calculation**: Determine highest severity
6. **Adapter Output**: Send to configured adapter

## 5. Features

### 5.1 Caller Position Detection
- **Stack Trace Parsing**: Analyzes Error.stack to find caller
- **Format Support**:
  - `at functionName (file:line:column)`
  - `at file:line:column`
- **Filtering**: Skips internal files (logger.ts, node_modules)
- **Extracted Data**: fileName, fileLine, funcName

### 5.2 Secret Masking
- **String Keywords**: Exact match replacement
- **Regex Patterns**: Pattern-based replacement
- **Masking Character**: Configurable (default: '*')
- **Deep Traversal**: Works on nested objects

### 5.3 Error Handling
- **Error Serialization**: Converts Error objects to structured format
- **Stack Trace**: Preserves stack trace as string array
- **Special Handling**: ERROR and CRITICAL severities get enhanced error info

### 5.4 Type Handling
- **BigInt**: Converted to string representation
- **Date**: Converted to ISO 8601 string
- **Circular References**: Replaced with [Circular Reference]
- **Functions**: Converted to string representation

## 6. Adapters

### 6.1 NodeAdapter
- **Output**: stdout for DEBUG/INFO, stderr for WARNING/ERROR/CRITICAL
- **Features**:
  - Content length limiting with chunking
  - Configurable chunk size
  - Pretty printing option

### 6.2 Google Cloud Logging Adapter
- **Output**: stdout/stderr with GCP-specific formatting
- **Features**:
  - 16KB content limit (GCP requirement)
  - Adds time, severity, message fields at root
  - Special error formatting for ERROR/CRITICAL

### 6.3 Custom Adapters
- **Interface**: Implement `LoggerAdapter` with `output(record: LoggerRecord)` method
- **Use Cases**: File output, network logging, database storage

## 7. Integration Patterns

### 7.1 Basic Usage
```typescript
const adapter = createNodeAdapter();
const logone = createLogone(adapter);
const { logger, finish } = logone.start('process-name', { userId: 123 });

logger.info('Process started');
logger.debug('Debug information', { data: 'value' });
logger.error('An error occurred', new Error('Something went wrong'));

finish(); // Outputs single JSON line
```

### 7.2 Express Middleware
```typescript
app.use(createHandler({
  logLevel: 'INFO',
  maskKeywords: ['password', 'token']
}));

app.get('/api/users', (req, res) => {
  req.logger.info('Fetching users');
  res.json({ users: [] });
});
```

### 7.3 Custom Lifecycle Management
```typescript
class Service {
  async process(data: any) {
    const { logger, finish } = this.logone.start('service.process', { 
      dataId: data.id 
    });
    
    try {
      logger.info('Processing started');
      const result = await this.doWork(data);
      logger.info('Processing completed', { result });
      return result;
    } catch (error) {
      logger.error('Processing failed', error);
      throw error;
    } finally {
      finish();
    }
  }
}
```

## 8. Security Considerations

### 8.1 Secret Masking
- Always configure maskKeywords for sensitive fields
- Use regex patterns for complex masking rules
- Test masking configuration with sample data

### 8.2 Payload Sanitization
- Avoid logging raw request bodies
- Implement custom sanitization for specific data types
- Be cautious with error stack traces in production

## 9. Performance Considerations

### 9.1 Memory Usage
- Log entries are stored in memory until finish()
- Consider lifecycle duration and log volume
- Implement custom adapters for high-volume scenarios

### 9.2 Processing Overhead
- Stack trace parsing has performance cost
- Secret masking traverses entire payload
- Consider log level in production environments

## 10. Testing Strategy

### 10.1 Unit Tests
- Test each component in isolation
- Mock dependencies (Timer, Stacker)
- Verify edge cases and error conditions

### 10.2 Integration Tests
- Test complete logging lifecycle
- Verify adapter output format
- Test Express middleware integration

### 10.3 Test Utilities
- Use FakeAdapter for output verification
- Use fakeTimer for deterministic timing
- Test with various payload types

## 11. Future Considerations

### 11.1 Potential Enhancements
- Async adapter support
- Batching for high-volume scenarios
- Custom processors in pipeline
- Structured query support
- Log sampling capabilities

### 11.2 Performance Optimizations
- Lazy evaluation of expensive operations
- Configurable stack trace depth
- Payload size limits
- Memory-efficient storage options

## 12. API Reference

### Factory Functions
- `createLogone(adapter: LoggerAdapter, config?: LogoneConfig): Logone`
- `createNodeAdapter(options?: NodeAdapterOptions): NodeAdapter`
- `createHandler(config?: LogoneExpressConfig): RequestHandler`

### Classes
- `Logone`: Main lifecycle manager
- `Logger`: Logging API provider
- `Timer`: Timing tracker
- `Stacker`: Entry storage
- `NodeAdapter`: Node.js output adapter

### Types
- `LoggerSeverity`: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
- `ElapsedUnit`: '1ms' | '10ms' | '100ms' | '1s'
- `LoggerContext`: Record<string, unknown>
- `LoggerAdapter`: { output(record: LoggerRecord): void }

## 13. Migration Guide

### From Traditional Logging
1. Replace multiple log statements with lifecycle-based approach
2. Collect related logs in single lifecycle
3. Add context at lifecycle start
4. Use finish() to output structured record

### Version Compatibility
- v1.0.0: Initial release
- v1.0.1: Bug fixes
- v1.0.2: Enhanced caller detection, added funcName field