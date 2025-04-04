import type {
  LogLevel,
  LogEntry,
  LoggerError,
  LoggerMetadata,
  ILogger,
} from "./logger";

class EdgeLoggerImpl implements ILogger {
  private static instance: EdgeLoggerImpl;

  private constructor() {}

  static getInstance(): EdgeLoggerImpl {
    if (!EdgeLoggerImpl.instance) {
      EdgeLoggerImpl.instance = new EdgeLoggerImpl();
    }
    return EdgeLoggerImpl.instance;
  }

  private log(
    level: LogLevel,
    message: string,
    metadata?: LoggerMetadata,
    error?: Error
  ) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(metadata && { context: metadata }),
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      }),
    };

    // Log to console in Edge Runtime
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

  // These methods are stubs since we don't store logs in Edge Runtime
  getLogs(): LogEntry[] {
    return [];
  }

  clearLogs(): void {}

  exportLogs(): string {
    return "[]";
  }
}

export const edgeLogger: ILogger = EdgeLoggerImpl.getInstance();
