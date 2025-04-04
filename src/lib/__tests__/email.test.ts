import { jest } from "@jest/globals";
import { sendApplicationEmail } from "../email";
import { logger as Logger } from "../logger-impl";

// Mock the logger
jest.mock("../logger-impl", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock the resend module
const mockSend = jest.fn();
const mockResend = {
  emails: {
    send: mockSend,
  },
};

// Mock the resend module and prevent test email initialization
jest.mock("../resend", () => {
  // Mock the test email initialization
  mockSend.mockResolvedValueOnce(undefined);

  return {
    resend: mockResend,
    __esModule: true,
    default: mockResend,
  };
});

// Mock process.env
process.env.RESEND_API_KEY = "test-api-key";

interface SendEmailResponse {
  id: string;
}

interface SendEmailParams {
  from: string;
  to: string[];
  subject: string;
  html: string;
}

describe("Email Service", () => {
  const validParams = {
    to: "test@example.com",
    jobTitle: "Software Engineer",
    applicantName: "John Doe",
    type: "creator" as const,
  };

  const networkError = new Error("Network error");

  beforeEach(() => {
    jest.clearAllMocks();
    mockSend.mockReset();
    mockSend.mockResolvedValue(undefined);
  });

  it("should send application email successfully", async () => {
    await sendApplicationEmail(validParams);

    expect(mockSend).toHaveBeenCalledWith({
      from: "iFreelancer <no-reply@ifreelancer.com>",
      to: [validParams.to],
      subject: "New application received",
      html: expect.stringContaining(validParams.applicantName),
    });

    expect(Logger.info).toHaveBeenCalledWith(
      "Application email sent successfully",
      expect.objectContaining({
        to: validParams.to,
        type: validParams.type,
        jobTitle: validParams.jobTitle,
        attempt: 1,
      })
    );
  });

  it("should retry on network error", async () => {
    mockSend
      .mockRejectedValueOnce(networkError)
      .mockResolvedValueOnce(undefined);

    await sendApplicationEmail(validParams);

    expect(mockSend).toHaveBeenCalledTimes(2);
    expect(Logger.warn).toHaveBeenCalledWith(
      "Email sending attempt 1 failed",
      expect.objectContaining({
        error: networkError.message,
        isNetworkError: true,
      })
    );
  });

  it("should throw error after max retries", async () => {
    mockSend
      .mockRejectedValueOnce(networkError)
      .mockRejectedValueOnce(networkError)
      .mockRejectedValueOnce(networkError);

    await expect(sendApplicationEmail(validParams)).rejects.toThrow(
      "Failed to send email after 3 attempts"
    );

    expect(Logger.error).toHaveBeenCalledWith(
      "Failed to send application email after all retries",
      networkError,
      expect.objectContaining({
        attempts: 3,
      })
    );
  });

  it("should format creator email content", async () => {
    await sendApplicationEmail(validParams);

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "New application received",
        html: expect.stringContaining("has applied for your job posting"),
      })
    );
  });

  it("should format applicant email content", async () => {
    const applicantParams = {
      ...validParams,
      type: "applicant" as const,
    };

    await sendApplicationEmail(applicantParams);

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "Your job application has been submitted",
        html: expect.stringContaining("Application Submitted"),
      })
    );
  });

  it("should validate email format", async () => {
    const invalidParams = {
      ...validParams,
      to: "invalid-email",
    };

    await expect(sendApplicationEmail(invalidParams)).rejects.toThrow(
      "Invalid email address format"
    );

    expect(mockSend).not.toHaveBeenCalled();
  });
});
