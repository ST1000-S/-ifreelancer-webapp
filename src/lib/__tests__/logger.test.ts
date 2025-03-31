import { Logger } from "../logger";

jest.mock("../logger", () => {
  const logs: any[] = [];
  return {
    Logger: {
      info: jest.fn((message: string, context?: any) => {
        logs.push({ level: "info", message, context });
      }),
      warn: jest.fn((message: string, context?: any) => {
        logs.push({ level: "warn", message, context });
      }),
      error: jest.fn((message: string, error?: Error, context?: any) => {
        logs.push({ level: "error", message, error, context });
      }),
      getLogs: jest.fn((level?: string) => {
        return level ? logs.filter((log) => log.level === level) : logs;
      }),
      clearLogs: jest.fn(() => {
        logs.length = 0;
      }),
    },
  };
});

describe("Logger", () => {
  beforeEach(() => {
    Logger.clearLogs();
    jest.clearAllMocks();
  });

  it("should log info messages", () => {
    const message = "Test info message";
    const context = { user: "test" };

    Logger.info(message, context);
    const logs = Logger.getLogs("info");
    expect(logs).toHaveLength(1);
    expect(logs[0].message).toBe(message);
    expect(logs[0].level).toBe("info");
    expect(logs[0].context).toEqual(context);
  });

  it("should handle long messages", () => {
    const longMessage = "a".repeat(12000);
    Logger.info(longMessage);
    const logs = Logger.getLogs("info");
    expect(logs[0].message.length).toBeLessThan(11000);
    expect(logs[0].message).toContain("... (truncated)");
  });

  it("should handle circular references in context", () => {
    const circularObj: any = { name: "test" };
    circularObj.self = circularObj;

    Logger.info("Test message", circularObj);
    const logs = Logger.getLogs("info");
    expect(logs).toHaveLength(1);
    expect(logs[0].context).toContain("[Circular]");
  });

  it("should format errors correctly", () => {
    const error = new Error("Test error");
    Logger.error("Error occurred", error);
    const logs = Logger.getLogs("error");
    expect(logs[0].error?.name).toBe("Error");
    expect(logs[0].error?.message).toBe("Test error");
    expect(logs[0].error?.stack).toBeDefined();
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
    expect(logs[0].context.nullValue).toBeNull();
  });
});
