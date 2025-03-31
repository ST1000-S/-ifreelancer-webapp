/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
  transformIgnorePatterns: ["node_modules/(?!(@auth/prisma-adapter)/)"],
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  moduleDirectories: ["node_modules", "<rootDir>"],
  testEnvironmentOptions: {
    url: "http://localhost",
  },
  resolver: "<rootDir>/jest.resolver.js",
};

module.exports = config;
