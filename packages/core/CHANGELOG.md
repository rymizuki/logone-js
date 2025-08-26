# @logone/core

## 1.1.2

### Patch Changes

- fix bugs

## 1.1.1

### Patch Changes

- fix: preserve Error object properties during serialization #18

## 1.1.0

### Minor Changes

- Minor version bump for all packages

## 1.0.2

### Patch Changes

- Fix logger caller position detection and add funcName field

  - Fixed incorrect fileLine and fileName detection in logger's getCallerPosition method
  - Changed from fixed stack trace index to dynamic regex-based parsing
  - Added support for different Node.js stack trace formats
  - Skip internal files (logger.ts, node_modules) when finding caller position
  - Added funcName field to LogRecord to capture the calling function name
  - Fixed return type to match actual implementation
  - Added comprehensive tests for caller position detection

## 1.0.1

### Patch Changes

- fix bugs

## 1.0.0

### Major Changes

- 4bd4190: v1.0.0-pre
- publish v1.0.0

### Patch Changes

- 0a88e61: remove console.log

## 1.0.0-pre.1

### Patch Changes

- remove console.log

## 1.0.0-pre.0

### Major Changes

- v1.0.0-pre

## 0.0.9

### Patch Changes

- update any fix

## 0.0.8

### Patch Changes

- support replacement Date and Error objects

## 0.0.7

### Patch Changes

- fix type

## 0.0.6

### Patch Changes

- minimium fix bugs

## 0.0.5

### Patch Changes

- update

## 0.0.4

### Patch Changes

- small fix and update

## 0.0.3

### Patch Changes

- fix core's maxiumum call stack exceeded

## 0.0.2

### Patch Changes

- export type LogoneConfig

## 0.0.1

### Patch Changes

- add feature for mask secret parameters
