# Logone-js Test Specification

## 1. @logone/core Package Tests

### 1.1 Logone Class

#### 1.1.1 Constructor Behavior
- **Use Case**: Initialize Logone instance with configuration
  - **Situation**: Valid adapter and complete configuration provided
    - **Expected Result**: Instance created with all config options applied
  - **Situation**: Valid adapter and partial configuration provided
    - **Expected Result**: Instance created with defaults for missing config options
  - **Situation**: Valid adapter and empty configuration object provided
    - **Expected Result**: Instance created with all default configuration
  - **Situation**: Valid adapter and no configuration provided
    - **Expected Result**: Instance created with all default configuration
  - **Situation**: Invalid log level in configuration
    - **Expected Result**: Should use default log level or throw validation error
  - **Situation**: Empty maskKeywords array in configuration
    - **Expected Result**: No masking applied during logging
  - **Situation**: Mixed string and RegExp patterns in maskKeywords
    - **Expected Result**: Both patterns applied correctly during masking

#### 1.1.2 Start Method Behavior
- **Use Case**: Begin a logging lifecycle with context
  - **Situation**: Valid type string and context object provided
    - **Expected Result**: Returns logger instance and finish function
  - **Situation**: Valid type string with no context provided
    - **Expected Result**: Returns logger instance and finish function with empty context
  - **Situation**: Empty string as type parameter
    - **Expected Result**: Creates lifecycle with empty type field
  - **Situation**: Complex nested context object provided
    - **Expected Result**: Context preserved in final output record
  - **Situation**: Context object with circular references provided
    - **Expected Result**: Circular references handled appropriately in output
  - **Situation**: Null or undefined type parameter
    - **Expected Result**: Should handle gracefully or throw descriptive error

#### 1.1.3 Finish Method Behavior
- **Use Case**: Complete logging lifecycle and output result
  - **Situation**: Multiple log entries of different severities collected
    - **Expected Result**: Output record contains all entries with highest severity calculated
  - **Situation**: No log entries collected before finish
    - **Expected Result**: Output record with empty lines array and appropriate severity
  - **Situation**: Only entries below configured log level collected
    - **Expected Result**: Output record with filtered entries based on log level
  - **Situation**: Finish called multiple times
    - **Expected Result**: Should handle gracefully (no-op or controlled behavior)
  - **Situation**: All entries have same severity level
    - **Expected Result**: Runtime severity matches the common severity level

#### 1.1.4 Log Level Filtering
- **Use Case**: Filter log entries based on configured minimum level
  - **Situation**: Log level set to INFO, DEBUG entries logged
    - **Expected Result**: DEBUG entries filtered out of final output
  - **Situation**: Log level set to ERROR, mixed severity entries logged
    - **Expected Result**: Only ERROR and CRITICAL entries in final output
  - **Situation**: Log level set to DEBUG, all severity levels logged
    - **Expected Result**: All entries included in final output
  - **Situation**: All logged entries below configured level
    - **Expected Result**: Empty lines array but valid record structure

#### 1.1.5 Secret Masking Integration
- **Use Case**: Apply secret masking to log payloads
  - **Situation**: String keyword matches found in nested object payload
    - **Expected Result**: Matching values replaced with masked string
  - **Situation**: RegExp pattern matches found in payload
    - **Expected Result**: Pattern matches replaced according to capture groups
  - **Situation**: Multiple keywords match same payload
    - **Expected Result**: All matching patterns masked appropriately
  - **Situation**: No keywords match payload content
    - **Expected Result**: Payload preserved unchanged

### 1.2 Logger Class

#### 1.2.1 Logging Methods (debug, info, warning, error, critical)
- **Use Case**: Log messages with various severity levels
  - **Situation**: Message with no additional arguments
    - **Expected Result**: Entry created with message and empty payload array
  - **Situation**: Message with single additional argument
    - **Expected Result**: Entry created with single argument as payload (not array)
  - **Situation**: Message with multiple additional arguments
    - **Expected Result**: Entry created with arguments array as payload
  - **Situation**: Empty string message provided
    - **Expected Result**: Entry created with empty string message
  - **Situation**: Very long message string provided
    - **Expected Result**: Entry created with complete message preserved
  - **Situation**: Message with unicode characters and emojis
    - **Expected Result**: Entry created with unicode properly preserved
  - **Situation**: Null or undefined message provided
    - **Expected Result**: Should handle gracefully or throw descriptive error

#### 1.2.2 Payload Handling
- **Use Case**: Process and store additional data with log entries
  - **Situation**: Circular reference object as payload
    - **Expected Result**: Circular references replaced with placeholder
  - **Situation**: Large nested object as payload
    - **Expected Result**: Complete object structure preserved in entry
  - **Situation**: Array with mixed data types as payload
    - **Expected Result**: Array structure and all elements preserved
  - **Situation**: Null or undefined payload arguments
    - **Expected Result**: Null/undefined values preserved in payload
  - **Situation**: Error object as payload
    - **Expected Result**: Error converted to serializable format with stack trace

#### 1.2.3 Caller Position Detection
- **Use Case**: Extract file name, line number, and function name from call site
  - **Situation**: Direct call from named function
    - **Expected Result**: Correct file, line, and function name extracted
  - **Situation**: Call from anonymous function
    - **Expected Result**: Correct file and line extracted, null function name
  - **Situation**: Call from deeply nested call stack
    - **Expected Result**: First non-logger file position extracted
  - **Situation**: Call from different file types (.js, .ts, .mjs)
    - **Expected Result**: Correct file path extracted regardless of extension
  - **Situation**: Stack trace unavailable or malformed
    - **Expected Result**: All position fields set to null gracefully
  - **Situation**: Call from within node_modules
    - **Expected Result**: First caller outside node_modules and logger.ts found

#### 1.2.4 Record Method
- **Use Case**: Create log entry with explicit severity
  - **Situation**: Valid severity string and message provided
    - **Expected Result**: Entry created with specified severity and message
  - **Situation**: Invalid severity string provided
    - **Expected Result**: Should handle gracefully or throw validation error
  - **Situation**: Empty message with valid severity
    - **Expected Result**: Entry created with empty message string

### 1.3 Timer Class

#### 1.3.1 Lifecycle Management
- **Use Case**: Track timing for logging sessions
  - **Situation**: Normal start and end sequence
    - **Expected Result**: Accurate start time, end time, and elapsed calculation
  - **Situation**: Multiple start calls before end
    - **Expected Result**: Should handle gracefully (reset or error)
  - **Situation**: End called before start
    - **Expected Result**: Should throw descriptive error
  - **Situation**: Multiple end calls
    - **Expected Result**: Should handle gracefully (no-op or controlled behavior)

#### 1.3.2 Time Access Properties
- **Use Case**: Access timing information during and after session
  - **Situation**: Access startTime before start called
    - **Expected Result**: Should throw descriptive error
  - **Situation**: Access endTime before end called
    - **Expected Result**: Should throw descriptive error
  - **Situation**: Access currentTime during active session
    - **Expected Result**: Returns current timestamp for log entry
  - **Situation**: Access elapsed during active session
    - **Expected Result**: Should throw error or return partial elapsed time

#### 1.3.3 Elapsed Time Calculation
- **Use Case**: Calculate duration in configured units
  - **Situation**: Very short duration (< 1ms)
    - **Expected Result**: Accurate sub-millisecond calculation based on unit
  - **Situation**: Long duration session
    - **Expected Result**: Accurate calculation for extended periods
  - **Situation**: Different elapsed units configured (1ms, 10ms, 100ms, 1s)
    - **Expected Result**: Elapsed time scaled correctly to configured unit

### 1.4 Stacker Class

#### 1.4.1 Entry Storage
- **Use Case**: Store log entries in chronological order
  - **Situation**: Single entry added
    - **Expected Result**: Entry stored and accessible via entries property
  - **Situation**: Multiple entries added in sequence
    - **Expected Result**: All entries stored in chronological order
  - **Situation**: Large number of entries added
    - **Expected Result**: All entries stored with acceptable performance
  - **Situation**: Duplicate entries added
    - **Expected Result**: All entries stored including duplicates

#### 1.4.2 Entry Access
- **Use Case**: Retrieve stored entries for processing
  - **Situation**: Access entries when empty
    - **Expected Result**: Returns empty array
  - **Situation**: Access hasEntries when empty
    - **Expected Result**: Returns false
  - **Situation**: Access hasEntries with stored entries
    - **Expected Result**: Returns true

### 1.5 Helper Functions

#### 1.5.1 convertObjectToString Helper
- **Use Case**: Convert JavaScript objects to JSON-serializable format
  - **Situation**: BigInt values (positive, negative, large)
    - **Expected Result**: Converted to string representation
  - **Situation**: Date objects (valid and invalid dates)
    - **Expected Result**: Valid dates converted to ISO string, invalid preserved
  - **Situation**: Error objects with stack traces
    - **Expected Result**: Converted to object with message, stack, and other properties
  - **Situation**: Objects with custom toJSON methods
    - **Expected Result**: toJSON method called and result used
  - **Situation**: Nested objects with mixed special types
    - **Expected Result**: All special types converted recursively
  - **Situation**: Arrays with mixed types including special types
    - **Expected Result**: Array structure preserved with types converted

#### 1.5.2 excludeRecursiveReference Helper
- **Use Case**: Replace circular references with placeholders
  - **Situation**: Simple self-reference (obj.self = obj)
    - **Expected Result**: Self-reference replaced with [Circular] string
  - **Situation**: Mutual references between objects
    - **Expected Result**: Both circular paths replaced with [Circular]
  - **Situation**: Deep circular references (nested levels)
    - **Expected Result**: Circular reference at appropriate depth replaced
  - **Situation**: Arrays with circular references
    - **Expected Result**: Array circular references handled properly
  - **Situation**: Large objects without circular references
    - **Expected Result**: No modifications made, performance acceptable

#### 1.5.3 logLevel Helper
- **Use Case**: Filter entries by minimum severity level
  - **Situation**: DEBUG level with mixed severity entries
    - **Expected Result**: All entries pass through filter
  - **Situation**: INFO level with DEBUG entries present
    - **Expected Result**: DEBUG entries filtered out, others preserved
  - **Situation**: ERROR level with WARNING and below entries
    - **Expected Result**: Only ERROR and CRITICAL entries preserved
  - **Situation**: CRITICAL level with mixed entries
    - **Expected Result**: Only CRITICAL entries preserved
  - **Situation**: Empty entries array
    - **Expected Result**: Returns empty array

#### 1.5.4 maskSecretParameters Helper
- **Use Case**: Mask sensitive data in payloads
  - **Situation**: String keyword exact match in flat object
    - **Expected Result**: Matching value replaced with asterisks
  - **Situation**: RegExp pattern match with capture groups
    - **Expected Result**: Matched portion replaced according to pattern
  - **Situation**: Nested object with sensitive keys at various depths
    - **Expected Result**: All matching keys masked regardless of nesting
  - **Situation**: Arrays containing objects with sensitive keys
    - **Expected Result**: Sensitive data in array elements masked
  - **Situation**: Mixed string and RegExp keywords
    - **Expected Result**: Both types of patterns applied correctly
  - **Situation**: Case-sensitive keyword matching
    - **Expected Result**: Exact case matching for string keywords
  - **Situation**: Very long values requiring masking
    - **Expected Result**: Complete value replaced with appropriate mask
  - **Situation**: Non-string values requiring masking
    - **Expected Result**: Values converted to string before masking

## 2. @logone/adapter-node Package Tests

### 2.1 NodeAdapter Class

#### 2.1.1 Output Routing
- **Use Case**: Route log records to appropriate output streams
  - **Situation**: Record with DEBUG severity
    - **Expected Result**: Output sent to stdout
  - **Situation**: Record with INFO severity
    - **Expected Result**: Output sent to stdout
  - **Situation**: Record with WARNING severity
    - **Expected Result**: Output sent to stderr
  - **Situation**: Record with ERROR severity
    - **Expected Result**: Output sent to stderr
  - **Situation**: Record with CRITICAL severity
    - **Expected Result**: Output sent to stderr
  - **Situation**: Mixed severity entries in single record
    - **Expected Result**: Routing based on highest severity in record

#### 2.1.2 Content Length Limiting
- **Use Case**: Handle records exceeding configured content limits
  - **Situation**: Record under content limit
    - **Expected Result**: Single output with complete record
  - **Situation**: Record exactly at content limit
    - **Expected Result**: Single output with complete record
  - **Situation**: Record over content limit with multiple entries
    - **Expected Result**: Multiple chunked outputs with divided entries
  - **Situation**: Single entry exceeding content limit
    - **Expected Result**: Single output with oversized entry (cannot chunk further)
  - **Situation**: Record requiring multiple chunking iterations
    - **Expected Result**: Multiple outputs until all entries processed

#### 2.1.3 JSON Formatting
- **Use Case**: Format log records as valid JSON
  - **Situation**: Record with circular references
    - **Expected Result**: Valid JSON output with circular references handled
  - **Situation**: Record with special characters and unicode
    - **Expected Result**: Proper JSON escaping and unicode preservation
  - **Situation**: Record with very large nested objects
    - **Expected Result**: Complete object structure in valid JSON format
  - **Situation**: Record with mixed data types in payloads
    - **Expected Result**: All data types properly JSON serialized

#### 2.1.4 Constructor Options
- **Use Case**: Configure adapter behavior via options
  - **Situation**: No options provided (default configuration)
    - **Expected Result**: Default content length limit applied
  - **Situation**: Custom contentLengthLimit provided
    - **Expected Result**: Custom limit used for chunking decisions
  - **Situation**: Invalid contentLengthLimit provided
    - **Expected Result**: Should handle gracefully or use default
  - **Situation**: Additional options provided
    - **Expected Result**: Options properly applied to adapter behavior

#### 2.1.5 Error Handling
- **Use Case**: Handle errors during output operations
  - **Situation**: stdout write failure
    - **Expected Result**: Error handled gracefully without crashing
  - **Situation**: stderr write failure
    - **Expected Result**: Error handled gracefully without crashing
  - **Situation**: JSON serialization failure
    - **Expected Result**: Error handled with appropriate fallback
  - **Situation**: Out of memory during large object processing
    - **Expected Result**: Graceful handling or controlled failure

## 3. @logone/adapter-google-cloud-logging Package Tests

### 3.1 GoogleCloudLoggingAdapter Class

#### 3.1.1 Field Mapping
- **Use Case**: Add Google Cloud Logging specific fields to records
  - **Situation**: Record with standard fields
    - **Expected Result**: time, severity fields added at root level
  - **Situation**: Record with ERROR severity entries
    - **Expected Result**: message field added with first ERROR message
  - **Situation**: Record with CRITICAL severity entries
    - **Expected Result**: message field added with first CRITICAL message
  - **Situation**: Record with both ERROR and CRITICAL entries
    - **Expected Result**: message field uses first encountered error message
  - **Situation**: Record with no ERROR or CRITICAL entries
    - **Expected Result**: No message field added
  - **Situation**: ERROR entry with no message
    - **Expected Result**: Should handle gracefully

#### 3.1.2 Content Limit Enforcement
- **Use Case**: Enforce 16KB content limit for Google Cloud Logging
  - **Situation**: Record under 16KB limit
    - **Expected Result**: Single output with complete record
  - **Situation**: Record over 16KB limit
    - **Expected Result**: Chunked output respecting 16KB limit
  - **Situation**: Single entry over 16KB
    - **Expected Result**: Single output with oversized entry

#### 3.1.3 Time Format Compatibility
- **Use Case**: Ensure time format compatible with Google Cloud Logging
  - **Situation**: Record with various timestamp formats
    - **Expected Result**: Time field properly formatted for GCP
  - **Situation**: Record with invalid timestamps
    - **Expected Result**: Should handle gracefully with fallback

## 4. @logone/express Package Tests

### 4.1 Express Middleware

#### 4.1.1 Request Context Capture
- **Use Case**: Capture request information for logging context
  - **Situation**: Request with all standard headers (host, content-type, user-agent)
    - **Expected Result**: All headers captured in context
  - **Situation**: Request with missing headers
    - **Expected Result**: Missing headers handled gracefully (null or default values)
  - **Situation**: Request with very long URL
    - **Expected Result**: Complete URL preserved in context
  - **Situation**: Request with special characters in headers
    - **Expected Result**: Special characters properly handled in context
  - **Situation**: Request with multiple values for same header
    - **Expected Result**: Header values properly represented in context

#### 4.1.2 Logger Attachment
- **Use Case**: Attach logger instance to request object
  - **Situation**: Normal request processing
    - **Expected Result**: req.logger available and functional
  - **Situation**: Multiple middleware accessing req.logger
    - **Expected Result**: Same logger instance accessible throughout request
  - **Situation**: Nested route handlers using logger
    - **Expected Result**: Logger maintains consistency across handlers
  - **Situation**: Concurrent requests
    - **Expected Result**: Each request gets isolated logger instance

#### 4.1.3 Response Lifecycle Management
- **Use Case**: Automatically finish logging when response completes
  - **Situation**: Normal request completion with response.end()
    - **Expected Result**: Logger automatically finished with timing data
  - **Situation**: Request timeout scenario
    - **Expected Result**: Logger finished appropriately on timeout
  - **Situation**: Client disconnection before response complete
    - **Expected Result**: Logger finished on close event
  - **Situation**: Server error during request processing
    - **Expected Result**: Logger finished with error context
  - **Situation**: Multiple close events on same response
    - **Expected Result**: Logger finish handled gracefully (no duplicate processing)

#### 4.1.4 Configuration Handling
- **Use Case**: Apply middleware configuration to logging behavior
  - **Situation**: Custom adapter provided in configuration
    - **Expected Result**: Custom adapter used for all request logging
  - **Situation**: Custom logone configuration provided
    - **Expected Result**: Configuration applied to all logger instances
  - **Situation**: Default configuration used
    - **Expected Result**: Default adapter and settings applied
  - **Situation**: Partial configuration provided
    - **Expected Result**: Defaults used for missing configuration options

#### 4.1.5 Integration Scenarios
- **Use Case**: Work correctly within Express application context
  - **Situation**: Middleware used before route handlers
    - **Expected Result**: Logger available in all subsequent middleware and routes
  - **Situation**: Middleware used with error handling middleware
    - **Expected Result**: Logging works correctly even when errors occur
  - **Situation**: Middleware used with static file serving
    - **Expected Result**: Static file requests logged appropriately
  - **Situation**: Middleware used in complex route structures
    - **Expected Result**: Logger context preserved across route complexity

#### 4.1.6 Memory and Performance
- **Use Case**: Ensure efficient resource usage under load
  - **Situation**: High concurrent request load
    - **Expected Result**: Acceptable memory usage and performance
  - **Situation**: Long-running requests
    - **Expected Result**: No memory leaks in logger instances
  - **Situation**: Requests with large payloads logged
    - **Expected Result**: Memory efficiently managed for large logs

## 5. Integration and End-to-End Tests

### 5.1 Cross-Component Integration

#### 5.1.1 Core to Adapter Flow
- **Use Case**: Verify complete logging pipeline from core to output
  - **Situation**: Complex logging scenario with all features used
    - **Expected Result**: All data properly flows from core through adapter to output
  - **Situation**: Error in adapter during output
    - **Expected Result**: Error handled gracefully without affecting core operation

#### 5.1.2 Express to Core Integration
- **Use Case**: Verify Express middleware properly uses core logging
  - **Situation**: Complete request lifecycle with various log entries
    - **Expected Result**: Single comprehensive log record output at request end
  - **Situation**: Request with errors and successful operations
    - **Expected Result**: All log entries captured with appropriate context

### 5.2 Performance and Load Testing

#### 5.2.1 High-Volume Scenarios
- **Use Case**: Verify system behavior under high load
  - **Situation**: Many rapid log entries within single lifecycle
    - **Expected Result**: All entries captured with acceptable performance
  - **Situation**: Many concurrent logging lifecycles
    - **Expected Result**: Each lifecycle isolated with good performance
  - **Situation**: Very large payloads in log entries
    - **Expected Result**: Large payloads handled without memory issues

### 5.3 Security Testing

#### 5.3.1 Input Validation and Safety
- **Use Case**: Ensure malicious input handled safely
  - **Situation**: Attempt to log malicious objects (prototype pollution)
    - **Expected Result**: System remains secure, no prototype pollution
  - **Situation**: Extremely deep object nesting in payloads
    - **Expected Result**: Stack overflow protection, graceful handling
  - **Situation**: Very large string values in logs
    - **Expected Result**: Memory usage controlled, no system crash

#### 5.3.2 Secret Masking Effectiveness
- **Use Case**: Verify sensitive data properly masked in all scenarios
  - **Situation**: Complex nested objects with sensitive data at various levels
    - **Expected Result**: All sensitive data masked regardless of nesting
  - **Situation**: Attempts to bypass masking with creative key names
    - **Expected Result**: Masking patterns work as intended
  - **Situation**: Sensitive data in error stack traces
    - **Expected Result**: Stack traces properly sanitized

## 6. Error Handling and Edge Cases

### 6.1 Malformed Input Handling

#### 6.1.1 Invalid Configuration
- **Use Case**: Handle invalid or malformed configuration gracefully
  - **Situation**: Invalid data types in configuration
    - **Expected Result**: Validation errors or safe defaults applied
  - **Situation**: Configuration with circular references
    - **Expected Result**: Configuration handled safely

#### 6.1.2 Runtime Errors
- **Use Case**: Handle runtime errors during logging operations
  - **Situation**: Out of memory during large object processing
    - **Expected Result**: Graceful degradation or controlled failure
  - **Situation**: Stack overflow in nested object processing
    - **Expected Result**: Stack protection and error handling
  - **Situation**: JSON serialization failures
    - **Expected Result**: Fallback serialization or error logging

### 6.2 System Resource Limits

#### 6.2.1 Memory Constraints
- **Use Case**: Operate correctly under memory pressure
  - **Situation**: Limited available memory during logging
    - **Expected Result**: Memory efficient operation or graceful failure
  - **Situation**: Memory leaks in long-running processes
    - **Expected Result**: Proper cleanup and no memory accumulation

#### 6.2.2 File System Limits
- **Use Case**: Handle file system constraints (if applicable to future file adapters)
  - **Situation**: Disk space limitations
    - **Expected Result**: Appropriate error handling
  - **Situation**: File permission issues
    - **Expected Result**: Clear error messages and fallback behavior