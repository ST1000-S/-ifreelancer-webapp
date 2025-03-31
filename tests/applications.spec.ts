import { test, expect } from "@playwright/test";

const freelancerUser = {
  email: "freelancer@example.com",
  password: "password123",
};

const clientUser = {
  email: "client@example.com",
  password: "password123",
};

const jobData = {
  title: "Frontend Developer",
  description: "Looking for a skilled frontend developer",
  budget: "5000",
  type: "REMOTE",
};

const applicationData = {
  coverLetter:
    "I am very interested in this position and have relevant experience.",
  proposedRate: "45",
  availability: "2 weeks notice",
  startDate: "2024-04-15",
  portfolio: ["https://github.com/example", "https://portfolio.example.com"],
  attachments: ["tests/fixtures/resume.pdf"],
};

test.describe("Job Applications", () => {
  test.describe("Freelancer Flow", () => {
    test.beforeEach(async ({ page }) => {
      // Login as freelancer
      await page.goto("/auth/signin");
      await page.getByLabel("Email").fill(freelancerUser.email);
      await page.getByLabel("Password").fill(freelancerUser.password);
      await page.getByRole("button", { name: /sign in/i }).click();
      await expect(page).toHaveURL("/dashboard");
    });

    test("should submit job application", async ({ page }) => {
      // Navigate to job listing
      await page.goto("/jobs");
      await page.getByText(jobData.title).click();
      await page.getByRole("button", { name: /apply/i }).click();

      // Fill application form
      await page.getByLabel("Cover Letter").fill(applicationData.coverLetter);
      await page.getByLabel("Proposed Rate").fill(applicationData.proposedRate);
      await page.getByLabel("Availability").fill(applicationData.availability);
      await page.getByLabel("Start Date").fill(applicationData.startDate);

      // Add portfolio links
      for (const link of applicationData.portfolio) {
        await page.getByLabel("Portfolio Link").fill(link);
        await page.getByRole("button", { name: /add link/i }).click();
      }

      // Upload attachments
      await page.setInputFiles(
        'input[type="file"]',
        applicationData.attachments
      );

      // Submit application
      await page.getByRole("button", { name: /submit application/i }).click();
      await expect(
        page.getByText("Application submitted successfully")
      ).toBeVisible();
    });

    test("should validate application form", async ({ page }) => {
      await page.goto("/jobs");
      await page.getByText(jobData.title).click();
      await page.getByRole("button", { name: /apply/i }).click();

      // Try to submit empty form
      await page.getByRole("button", { name: /submit application/i }).click();
      await expect(page.getByText("Cover letter is required")).toBeVisible();
      await expect(page.getByText("Proposed rate is required")).toBeVisible();

      // Test invalid rate
      await page.getByLabel("Proposed Rate").fill("-30");
      await expect(
        page.getByText("Rate must be a positive number")
      ).toBeVisible();
    });

    test("should view application status", async ({ page }) => {
      await page.goto("/dashboard/applications");
      await expect(page.getByText(jobData.title)).toBeVisible();
      await expect(page.getByText("PENDING")).toBeVisible();
    });

    test("should withdraw application", async ({ page }) => {
      await page.goto("/dashboard/applications");
      await page.getByText(jobData.title).click();
      await page.getByRole("button", { name: /withdraw/i }).click();
      await page.getByRole("button", { name: /confirm/i }).click();
      await expect(page.getByText("Application withdrawn")).toBeVisible();
    });
  });

  test.describe("Client Flow", () => {
    test.beforeEach(async ({ page }) => {
      // Login as client
      await page.goto("/auth/signin");
      await page.getByLabel("Email").fill(clientUser.email);
      await page.getByLabel("Password").fill(clientUser.password);
      await page.getByRole("button", { name: /sign in/i }).click();
      await expect(page).toHaveURL("/dashboard");
    });

    test("should review applications", async ({ page }) => {
      await page.goto("/dashboard/jobs");
      await page.getByText(jobData.title).click();
      await page.getByRole("tab", { name: /applications/i }).click();
      await expect(page.getByText("Applications")).toBeVisible();
    });

    test("should accept application", async ({ page }) => {
      await page.goto("/dashboard/jobs");
      await page.getByText(jobData.title).click();
      await page.getByRole("tab", { name: /applications/i }).click();

      // View application details
      await page.getByText(freelancerUser.email).click();
      await expect(page.getByText(applicationData.coverLetter)).toBeVisible();

      // Accept application
      await page.getByRole("button", { name: /accept/i }).click();
      await page.getByRole("button", { name: /confirm/i }).click();
      await expect(page.getByText("Application accepted")).toBeVisible();
    });

    test("should reject application", async ({ page }) => {
      await page.goto("/dashboard/jobs");
      await page.getByText(jobData.title).click();
      await page.getByRole("tab", { name: /applications/i }).click();

      // View application details
      await page.getByText(freelancerUser.email).click();

      // Reject application
      await page.getByRole("button", { name: /reject/i }).click();
      await page
        .getByLabel("Rejection Reason")
        .fill("Position has been filled");
      await page.getByRole("button", { name: /confirm/i }).click();
      await expect(page.getByText("Application rejected")).toBeVisible();
    });

    test("should message applicant", async ({ page }) => {
      await page.goto("/dashboard/jobs");
      await page.getByText(jobData.title).click();
      await page.getByRole("tab", { name: /applications/i }).click();

      // Open message dialog
      await page.getByText(freelancerUser.email).click();
      await page.getByRole("button", { name: /message/i }).click();

      // Send message
      await page
        .getByLabel("Message")
        .fill("Are you available for an interview next week?");
      await page.getByRole("button", { name: /send/i }).click();
      await expect(page.getByText("Message sent")).toBeVisible();
    });
  });
});
