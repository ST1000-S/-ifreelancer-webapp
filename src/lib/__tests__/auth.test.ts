import { validateToken, isStrongPassword } from "../security";
import { Logger } from "../logger";

jest.mock("../logger");

describe("Auth Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("validateToken", () => {
    it("should validate JWT format", () => {
      const validToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      const invalidToken = "invalid-token";

      expect(validateToken(validToken)).toBe(true);
      expect(validateToken(invalidToken)).toBe(false);
    });
  });

  describe("isStrongPassword", () => {
    it("should validate password strength", () => {
      const strongPassword = "StrongP@ss123";
      const weakPassword = "weak";

      expect(isStrongPassword(strongPassword)).toBe(true);
      expect(isStrongPassword(weakPassword)).toBe(false);
    });

    it("should require minimum length", () => {
      const shortPassword = "Sh@rt1";
      expect(isStrongPassword(shortPassword)).toBe(false);
    });

    it("should require uppercase letter", () => {
      const noUppercase = "password@123";
      expect(isStrongPassword(noUppercase)).toBe(false);
    });

    it("should require lowercase letter", () => {
      const noLowercase = "PASSWORD@123";
      expect(isStrongPassword(noLowercase)).toBe(false);
    });

    it("should require number", () => {
      const noNumber = "Password@abc";
      expect(isStrongPassword(noNumber)).toBe(false);
    });

    it("should require special character", () => {
      const noSpecial = "Password123";
      expect(isStrongPassword(noSpecial)).toBe(false);
    });
  });
});
