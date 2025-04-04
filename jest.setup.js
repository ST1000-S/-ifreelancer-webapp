import { TextEncoder, TextDecoder } from "util";
import "@testing-library/jest-dom";
import { jest } from "@jest/globals";

// Mock node-fetch
global.fetch = jest.fn();

// Mock Headers with proper implementation
class MockHeaders {
  constructor(init = {}) {
    this.headers = new Map();
    if (init) {
      Object.entries(init).forEach(([key, value]) => {
        this.set(key, value);
      });
    }
  }

  set(key, value) {
    this.headers.set(key.toLowerCase(), value);
  }

  get(key) {
    return this.headers.get(key.toLowerCase()) || null;
  }

  has(key) {
    return this.headers.has(key.toLowerCase());
  }

  delete(key) {
    this.headers.delete(key.toLowerCase());
  }

  forEach(callback) {
    this.headers.forEach((value, key) => callback(value, key, this));
  }
}

global.Headers = MockHeaders;
global.Request = jest.fn();
global.Response = jest.fn();

// Set environment variables for testing
process.env.NODE_ENV = "test";
process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000";
process.env.NEXTAUTH_SECRET = "test_secret";
process.env.RESEND_API_KEY = "test_key";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db";
process.env.REDIS_URL = "redis://localhost:6379";

// Mock TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock ResizeObserver
window.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock console methods
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

const nextRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  reload: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  beforePopState: jest.fn(),
  useRouter: () => nextRouter,
};

jest.mock("next/router", () => ({
  __esModule: true,
  useRouter: () => nextRouter,
}));

jest.mock("next/navigation", () => ({
  useRouter: () => nextRouter,
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => null),
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({ data: null, status: "unauthenticated" })),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock("@auth/prisma-adapter", () => ({
  PrismaAdapter: jest.fn(() => ({
    createUser: jest.fn(),
    getUser: jest.fn(),
    getUserByEmail: jest.fn(),
    getUserByAccount: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    linkAccount: jest.fn(),
    unlinkAccount: jest.fn(),
    createSession: jest.fn(),
    getSessionAndUser: jest.fn(),
    updateSession: jest.fn(),
    deleteSession: jest.fn(),
    createVerificationToken: jest.fn(),
    useVerificationToken: jest.fn(),
  })),
}));

jest.mock("next/server", () => {
  const mockResponse = {
    status: 200,
    headers: new Headers(),
  };

  return {
    __esModule: true,
    NextResponse: {
      next: jest.fn().mockReturnValue(mockResponse),
      json: jest.fn().mockImplementation((body, init) => ({
        ...mockResponse,
        status: init && init.status ? init.status : 200,
      })),
    },
  };
});
