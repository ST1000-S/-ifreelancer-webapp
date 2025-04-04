import type { LogLevel, LogEntry, LogContext, LoggerService } from "./logger";

export class LoggerImpl implements LoggerService {
  private static instance: LoggerImpl;
  private maxMessageLength = 10000;
  private truncationSuffix = "... (truncated)";
  private logs: Record<LogLevel, LogEntry[]> = {
    debug: [],
    info: [],
    warn: [],
    error: [],
  };

  private constructor() {
    // Handle uncaught exceptions
    process.on("uncaughtException", (error: Error) => {
      this.error("Uncaught Exception", error);
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason: unknown) => {
      this.error(
        "Unhandled Promise Rejection",
        reason instanceof Error ? reason : new Error(String(reason))
      );
    });
  }

  public static getInstance(): LoggerImpl {
    if (!LoggerImpl.instance) {
      LoggerImpl.instance = new LoggerImpl();
    }
    return LoggerImpl.instance;
  }

  private sanitizeMessage(message: string): string {
    if (message.length <= this.maxMessageLength) {
      return message;
    }
    return (
      message.substring(
        0,
        this.maxMessageLength - this.truncationSuffix.length
      ) + this.truncationSuffix
    );
  }

  private sanitizeContext(context: LogContext): LogContext {
    const seen = new WeakSet();
    const sanitize = (obj: unknown): unknown => {
      if (obj === null || typeof obj !== "object") {
        return obj;
      }

      if (obj instanceof Object && seen.has(obj)) {
        return "[Circular]";
      }
      if (obj instanceof Object) {
        seen.add(obj);
      }

      if (obj instanceof Error) {
        return {
          name: obj.name,
          message: obj.message,
          stack: obj.stack,
        };
      }

      if (Array.isArray(obj)) {
        return obj.map((item) => sanitize(item));
      }

      if (obj instanceof Object) {
        const sanitized: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj)) {
          sanitized[key] = sanitize(value);
        }
        return sanitized;
      }

      return obj;
    };

    return sanitize(context) as LogContext;
  }

  log(level: LogLevel, message: string, context?: LogContext): void {
    const sanitizedMessage = this.sanitizeMessage(message);
    const sanitizedContext = context
      ? this.sanitizeContext(context)
      : undefined;

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message: sanitizedMessage,
      context: sanitizedContext,
    };

    this.logs[level].push(entry);

    // Log to console for development
    const consoleMessage = `[${entry.timestamp.toISOString()}] ${level.toUpperCase()}: ${sanitizedMessage}`;
    if (sanitizedContext) {
      console.log(consoleMessage, sanitizedContext);
    } else {
      console.log(consoleMessage);
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log("debug", message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log("warn", message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    const errorContext = error
      ? {
          ...context,
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
        }
      : context;
    this.log("error", message, errorContext);
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return [...this.logs[level]];
    }
    return Object.values(this.logs).flat();
  }

  clearLogs() {
    Object.keys(this.logs).forEach((level) => {
      this.logs[level as LogLevel] = [];
    });
  }

  exportLogs(): Record<LogLevel, LogEntry[]> {
    return { ...this.logs };
  }
}

export const logger = LoggerImpl.getInstance();
