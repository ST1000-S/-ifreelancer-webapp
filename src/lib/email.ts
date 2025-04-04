import { resend } from "./resend";
import { Logger } from "./logger";

interface EmailParams {
  to: string;
  jobTitle: string;
  applicantName: string;
  type: "applicant" | "creator";
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendApplicationEmail({
  to,
  jobTitle,
  applicantName,
  type,
}: EmailParams) {
  const subject =
    type === "applicant"
      ? "Your job application has been submitted"
      : "New application received";

  const html =
    type === "applicant"
      ? `
      <h1>Application Submitted</h1>
      <p>Hi ${applicantName},</p>
      <p>Your application for the position "${jobTitle}" has been successfully submitted.</p>
      <p>We will notify you when the job poster reviews your application.</p>
      <p>Best regards,<br/>iFreelancer Team</p>
    `
      : `
      <h1>New Application Received</h1>
      <p>Hello,</p>
      <p>${applicantName} has applied for your job posting "${jobTitle}".</p>
      <p>Please review their application and respond at your earliest convenience.</p>
      <p>Best regards,<br/>iFreelancer Team</p>
    `;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Validate email address format
      if (!to.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        throw new Error("Invalid email address format");
      }

      // Add exponential backoff delay between retries
      if (attempt > 1) {
        const delay = RETRY_DELAY * Math.pow(2, attempt - 1);
        await sleep(delay);
      }

      await resend.emails.send({
        from: "iFreelancer <no-reply@ifreelancer.com>",
        to: [to],
        subject,
        html,
      });

      Logger.info("Application email sent successfully", {
        to,
        type,
        jobTitle,
        attempt,
      });

      return;
    } catch (error) {
      lastError = error as Error;

      // Check if it's a network error
      const isNetworkError =
        error instanceof Error &&
        (error.message.includes("network") ||
          error.message.includes("timeout") ||
          error.message.includes("ECONNREFUSED"));

      Logger.warn(`Email sending attempt ${attempt} failed`, {
        to,
        type,
        jobTitle,
        error: lastError.message,
        isNetworkError,
      });

      // Only retry on network errors or if we haven't hit max retries
      if (isNetworkError && attempt < MAX_RETRIES) {
        continue;
      }
    }
  }

  // If we get here, all retries failed
  Logger.error(
    "Failed to send application email after all retries",
    lastError as Error,
    {
      to,
      type,
      jobTitle,
      attempts: MAX_RETRIES,
    }
  );

  throw new Error(
    `Failed to send email after ${MAX_RETRIES} attempts: ${lastError?.message}`
  );
}
