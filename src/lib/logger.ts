export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
    cause?: unknown;
  };
}

export interface LoggerError {
  message: string;
  code?: string;
  stack?: string;
  [key: string]: unknown;
}

export interface LoggerMetadata {
  [key: string]: unknown;
}

export interface ILogger {
  info(message: string, metadata?: LoggerMetadata): void;
  warn(message: string, metadata?: LoggerMetadata): void;
  error(
    message: string,
    error: Error | LoggerError,
    metadata?: LoggerMetadata
  ): void;
  debug(message: string, metadata?: LoggerMetadata): void;
  getLogs(level?: LogLevel, limit?: number): LogEntry[];
  clearLogs(): void;
  exportLogs(level?: LogLevel): string;
}

class LoggerImpl implements ILogger {
  private static instance: LoggerImpl;
  private logs: LogEntry[] = [];
  private readonly maxLogs = 1000;
  private readonly maxMessageLength = 10000; // Prevent memory issues from huge messages

  private constructor() {
    // Set up error handling for uncaught exceptions
    process.on("uncaughtException", (error) => {
      this.error("Uncaught Exception", error);
    });

    process.on("unhandledRejection", (reason) => {
      this.error(
        "Unhandled Promise Rejection",
        reason instanceof Error ? reason : new Error(String(reason))
      );
    });
  }

  static getInstance(): LoggerImpl {
    if (!LoggerImpl.instance) {
      LoggerImpl.instance = new LoggerImpl();
    }
    return LoggerImpl.instance;
  }

  private sanitizeMessage(message: string): string {
    // Truncate long messages
    if (message.length > this.maxMessageLength) {
      return (
        message.substring(0, this.maxMessageLength - 100) + "... (truncated)"
      );
    }
    return message;
  }

  private sanitizeContext(
    context?: Record<string, unknown>
  ): Record<string, unknown> | undefined {
    if (!context) return undefined;

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(context)) {
      // Skip null or undefined values
      if (value == null) continue;

      // Handle circular references and complex objects
      try {
        JSON.stringify(value);
        sanitized[key] = value;
      } catch (error) {
        if (typeof value === "object" && value !== null) {
          const circularRef = value as Record<string, unknown>;
          if (circularRef === context) {
            sanitized[key] = "[Circular]";
          } else {
            sanitized[key] = "[Complex Object]";
          }
        } else {
          sanitized[key] = String(value);
        }
      }
    }
    return sanitized;
  }

  private formatError(error: Error): LogEntry["error"] {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    };
  }

  private log(
    level: LogLevel,
    message: string,
    metadata?: LoggerMetadata,
    error?: Error
  ) {
    const timestamp = new Date().toISOString();
    const sanitizedMessage = this.sanitizeMessage(message);
    const sanitizedMetadata = this.sanitizeContext(metadata);

    const logEntry: LogEntry = {
      timestamp,
      level,
      message: sanitizedMessage,
      context: sanitizedMetadata,
      ...(error && { error: this.formatError(error) }),
    };

    // Add to logs array
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Also log to console
    console.log(JSON.stringify(logEntry));
  }

  info(message: string, metadata?: LoggerMetadata): void {
    this.log("info", message, metadata);
  }

  warn(message: string, metadata?: LoggerMetadata): void {
    this.log("warn", message, metadata);
  }

  error(
    message: string,
    error: Error | LoggerError,
    metadata?: LoggerMetadata
  ): void {
    this.log(
      "error",
      message,
      metadata,
      error instanceof Error ? error : new Error(error.message)
    );
  }

  debug(message: string, metadata?: LoggerMetadata): void {
    this.log("debug", message, metadata);
  }

  getLogs(level?: LogLevel, limit = 100): LogEntry[] {
    let filteredLogs = this.logs;
    if (level) {
      filteredLogs = this.logs.filter((log) => log.level === level);
    }
    return filteredLogs.slice(0, Math.min(limit, this.maxLogs));
  }

  clearLogs() {
    this.logs = [];
  }

  // Export logs to JSON for external processing
  exportLogs(level?: LogLevel): string {
    const logs = this.getLogs(level);
    return JSON.stringify(logs, null, 2);
  }
}

export const logger: ILogger = LoggerImpl.getInstance();
