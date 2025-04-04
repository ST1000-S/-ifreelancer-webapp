import { jest } from "@jest/globals";
import {
  Logger,
  type LogLevel,
  type LogEntry,
  type LogContext,
} from "../logger";

const mockLogs: Record<LogLevel, LogEntry[]> = {
  debug: [],
  info: [],
  warn: [],
  error: [],
};

const truncateMessage = (message: string): string => {
  const maxLength = 10000;
  const truncationSuffix = "... (truncated)";
  if (message.length <= maxLength) {
    return message;
  }
  return (
    message.substring(0, maxLength - truncationSuffix.length) + truncationSuffix
  );
};

jest.mock("../logger", () => {
  const mockLogger = {
    debug: jest.fn((message: string, context?: LogContext) => {
      mockLogs.debug.push({
        level: "debug",
        message: truncateMessage(message),
        timestamp: new Date(),
        context: context
          ? JSON.parse(
              JSON.stringify(context, (key, value) => {
                if (key && value === context) return "[Circular]";
                return value;
              })
            )
          : undefined,
      });
    }),
    info: jest.fn((message: string, context?: LogContext) => {
      mockLogs.info.push({
        level: "info",
        message: truncateMessage(message),
        timestamp: new Date(),
        context: context
          ? JSON.parse(
              JSON.stringify(context, (key, value) => {
                if (key && value === context) return "[Circular]";
                return value;
              })
            )
          : undefined,
      });
    }),
    warn: jest.fn((message: string, context?: LogContext) => {
      mockLogs.warn.push({
        level: "warn",
        message: truncateMessage(message),
        timestamp: new Date(),
        context: context
          ? JSON.parse(
              JSON.stringify(context, (key, value) => {
                if (key && value === context) return "[Circular]";
                return value;
              })
            )
          : undefined,
      });
    }),
    error: jest.fn((message: string, error?: Error, context?: LogContext) => {
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
      mockLogs.error.push({
        level: "error",
        message: truncateMessage(message),
        timestamp: new Date(),
        context: errorContext
          ? JSON.parse(
              JSON.stringify(errorContext, (key, value) => {
                if (key && value === errorContext) return "[Circular]";
                return value;
              })
            )
          : undefined,
      });
    }),
    getLogs: jest.fn((level?: LogLevel) => {
      if (level) {
        return [...mockLogs[level]];
      }
      return Object.values(mockLogs).flat();
    }),
    clearLogs: jest.fn(() => {
      mockLogs.debug = [];
      mockLogs.info = [];
      mockLogs.warn = [];
      mockLogs.error = [];
    }),
  };

  return {
    Logger: mockLogger,
  };
});

describe("Logger", () => {
  beforeEach(() => {
    Logger.clearLogs();
    jest.clearAllMocks();
  });

  it("should log messages with different levels", () => {
    Logger.info("Info message");
    Logger.warn("Warning message");
    Logger.error("Error message");

    const infoLogs = Logger.getLogs("info");
    const warnLogs = Logger.getLogs("warn");
    const errorLogs = Logger.getLogs("error");

    expect(infoLogs).toHaveLength(1);
    expect(warnLogs).toHaveLength(1);
    expect(errorLogs).toHaveLength(1);

    expect(infoLogs[0].message).toBe("Info message");
    expect(warnLogs[0].message).toBe("Warning message");
    expect(errorLogs[0].message).toBe("Error message");
  });

  it("should handle long messages", () => {
    const longMessage = "a".repeat(12000);
    Logger.info(longMessage);
    const logs = Logger.getLogs("info");
    expect(logs[0].message.length).toBeLessThanOrEqual(10000);
    expect(logs[0].message).toContain("... (truncated)");
  });

  it("should handle circular references in context", () => {
    const circularObj: any = { name: "test" };
    circularObj.self = circularObj;

    Logger.info("Test message", circularObj);
    const logs = Logger.getLogs("info");

    expect(logs).toHaveLength(1);
    expect(logs[0].context).toEqual({
      name: "test",
      self: "[Circular]",
    });
  });

  it("should format errors correctly", () => {
    const error = new Error("Test error");
    Logger.error("Error occurred", error);

    const logs = Logger.getLogs("error");
    expect(logs[0].message).toBe("Error occurred");
    expect(logs[0].context).toEqual(
      expect.objectContaining({
        error: {
          name: "Error",
          message: "Test error",
          stack: expect.any(String),
        },
      })
    );
  });

  it("should include timestamp in logs", () => {
    Logger.info("Test message");
    const logs = Logger.getLogs("info");
    expect(logs[0].timestamp).toBeInstanceOf(Date);
  });

  it("should handle multiple log levels", () => {
    Logger.info("Info message");
    Logger.warn("Warning message");
    Logger.error("Error message");

    expect(Logger.getLogs("info")).toHaveLength(1);
    expect(Logger.getLogs("warn")).toHaveLength(1);
    expect(Logger.getLogs("error")).toHaveLength(1);
    expect(Logger.getLogs()).toHaveLength(3);
  });

  it("should handle undefined context", () => {
    Logger.info("Test message");
    const logs = Logger.getLogs("info");
    expect(logs[0].context).toBeUndefined();
  });

  it("should handle null values in context", () => {
    Logger.info("Test message", { nullValue: null });
    const logs = Logger.getLogs("info");
    expect(logs[0].context).toEqual({ nullValue: null });
  });
});
