import { test, expect } from "@playwright/test";

// Test data
const clientUser = {
  email: "client@example.com",
  password: "password123",
};

const freelancerUser = {
  email: "freelancer@example.com",
  password: "password123",
};

const newUser = {
  email: "test@example.com",
  password: "password123",
  role: "CLIENT",
};

const jobData = {
  title: "Senior React Developer",
  description:
    "Looking for an experienced React developer for a long-term project",
  type: "REMOTE",
  budget: "8000",
  skills: ["React", "TypeScript", "Node.js"],
};

const applicationData = {
  coverLetter:
    "I am very interested in this position and have 5 years of relevant experience.",
  proposedRate: "75",
  availability: "Immediate",
  startDate: "2024-04-01",
};

test.describe("iFreelancer E2E Tests", () => {
  test("should sign up a new user", async ({ page }) => {
    await page.goto("/auth/signup");
    await page.getByLabel("Email").fill(newUser.email);
    await page.getByLabel("Password").fill(newUser.password);
    await page.getByLabel("Role").selectOption(newUser.role);
    await page.getByRole("button", { name: /sign up/i }).click();
    await expect(page).toHaveURL("/dashboard");
  });

  test("client workflow", async ({ page }) => {
    // Login as client
    await page.goto("/auth/signin");
    await page.getByLabel("Email").fill(clientUser.email);
    await page.getByLabel("Password").fill(clientUser.password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL("/dashboard");

    // Create a new job
    await page.goto("/jobs/create");
    await page.getByLabel("Title").fill(jobData.title);
    await page.getByLabel("Description").fill(jobData.description);
    await page.getByLabel("Type").selectOption(jobData.type);
    await page.getByLabel("Budget").fill(jobData.budget);
    for (const skill of jobData.skills) {
      await page.getByLabel("Skills").fill(skill);
      await page.keyboard.press("Enter");
    }
    await page.getByRole("button", { name: /create job/i }).click();

    // View posted jobs
    await page.goto("/dashboard");
    await expect(page.getByText(jobData.title)).toBeVisible();

    // Review applications (if any)
    await page.getByText(jobData.title).click();
    await expect(page.getByText("Applications")).toBeVisible();
  });

  test("freelancer workflow", async ({ page }) => {
    // Login as freelancer
    await page.goto("/auth/signin");
    await page.getByLabel("Email").fill(freelancerUser.email);
    await page.getByLabel("Password").fill(freelancerUser.password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL("/dashboard");

    // Browse and search jobs
    await page.goto("/jobs");
    await page.getByPlaceholder("Search jobs...").fill("React");
    await page.keyboard.press("Enter");
    await expect(page.getByText(/react/i)).toBeVisible();

    // Filter jobs
    await page.getByLabel("Type").selectOption("REMOTE");
    await expect(page.getByText("REMOTE")).toBeVisible();

    // Sort jobs
    await page.getByRole("button", { name: /sort/i }).click();
    await page.getByText("Budget: High to Low").click();

    // Apply for a job
    await page.getByText(jobData.title).first().click();
    await page.getByRole("button", { name: /apply/i }).click();
    await page.getByLabel("Cover Letter").fill(applicationData.coverLetter);
    await page.getByLabel("Proposed Rate").fill(applicationData.proposedRate);
    await page.getByLabel("Availability").fill(applicationData.availability);
    await page.getByLabel("Start Date").fill(applicationData.startDate);
    await page.getByRole("button", { name: /submit application/i }).click();

    // Check application status
    await page.goto("/dashboard");
    await expect(page.getByText(jobData.title)).toBeVisible();
    await expect(page.getByText("Pending")).toBeVisible();
  });
});
