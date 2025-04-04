/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  moduleNameMapper: {
    "\\.(css|less|sass|scss)$": "identity-obj-proxy",
    "\\.(gif|ttf|eot|svg|png)$": "<rootDir>/test/__mocks__/fileMock.js",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transformIgnorePatterns: ["/node_modules/(?!@auth/prisma-adapter)"],
};
