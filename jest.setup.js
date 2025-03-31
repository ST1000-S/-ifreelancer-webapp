/* global jest */

// Set environment variables for testing
process.env.NODE_ENV = "test";
process.env.RESEND_API_KEY = "test_key";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db";

// Mock console methods
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};
