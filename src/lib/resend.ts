import { Resend } from "resend";
import { logger } from "./logger";

if (!process.env.RESEND_API_KEY) {
  const error = new Error("RESEND_API_KEY is not defined");
  logger.error("Environment variable missing", error);
  throw error;
}

export const resend = new Resend(process.env.RESEND_API_KEY);

// Test connection by sending a test email
resend.emails
  .send({
    from: "test@ifreelancer.com",
    to: "test@ifreelancer.com",
    subject: "Test Connection",
    html: "Testing Resend connection",
  })
  .then(() => {
    logger.info("Resend service initialized successfully");
  })
  .catch((error: Error) => {
    logger.error("Failed to initialize Resend service", error);
  });

export default resend;
