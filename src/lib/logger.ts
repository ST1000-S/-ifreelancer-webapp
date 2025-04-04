import { LoggerImpl } from "./logger-impl";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  [key: string]:
    | string
    | number
    | boolean
    | null
    | undefined
    | LogContext
    | LogContext[];
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: LogContext;
}

export interface LoggerService {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: Error, context?: LogContext): void;
  getLogs(level?: LogLevel): LogEntry[];
  exportLogs(): Record<LogLevel, LogEntry[]>;
}

export const Logger = LoggerImpl.getInstance();
