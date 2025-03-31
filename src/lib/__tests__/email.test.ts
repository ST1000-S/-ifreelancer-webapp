import { sendApplicationEmail } from "../email";
import { resend } from "../resend";
import { logger } from "../logger";

// Mock resend
jest.mock("../resend", () => ({
  resend: {
    emails: {
      send: jest.fn(),
    },
  },
}));

// Mock logger
jest.mock("../logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe("Email Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validEmailParams = {
    to: "test@example.com",
    jobTitle: "Test Job",
    applicantName: "Test Applicant",
    type: "applicant" as const,
  };

  test("should send email successfully", async () => {
    (resend.emails.send as jest.Mock).mockResolvedValueOnce({ id: "test-id" });

    await sendApplicationEmail(validEmailParams);

    expect(resend.emails.send).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith(
      "Application email sent successfully",
      expect.any(Object)
    );
  });

  test("should retry on failure", async () => {
    (resend.emails.send as jest.Mock)
      .mockRejectedValueOnce(new Error("Network error"))
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({ id: "test-id" });

    await sendApplicationEmail(validEmailParams);

    expect(resend.emails.send).toHaveBeenCalledTimes(3);
    expect(logger.warn).toHaveBeenCalledTimes(2);
    expect(logger.info).toHaveBeenCalledTimes(1);
  });

  test("should throw error after max retries", async () => {
    const error = new Error("Network error");
    (resend.emails.send as jest.Mock).mockRejectedValue(error);

    await expect(sendApplicationEmail(validEmailParams)).rejects.toThrow();
    expect(resend.emails.send).toHaveBeenCalledTimes(3);
    expect(logger.error).toHaveBeenCalledWith(
      "Failed to send application email after all retries",
      error,
      expect.any(Object)
    );
  });

  test("should validate email format", async () => {
    await expect(
      sendApplicationEmail({
        ...validEmailParams,
        to: "invalid-email",
      })
    ).rejects.toThrow("Invalid email address format");

    expect(resend.emails.send).not.toHaveBeenCalled();
  });

  test("should format email content based on type", async () => {
    (resend.emails.send as jest.Mock).mockResolvedValueOnce({ id: "test-id" });

    // Test applicant email
    await sendApplicationEmail(validEmailParams);
    expect(resend.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "Your job application has been submitted",
        html: expect.stringContaining("Application Submitted"),
      })
    );

    // Test creator email
    await sendApplicationEmail({
      ...validEmailParams,
      type: "creator" as const,
    });
    expect(resend.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "New application received",
        html: expect.stringContaining("New Application Received"),
      })
    );
  });
});
