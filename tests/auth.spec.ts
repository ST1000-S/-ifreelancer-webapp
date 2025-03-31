import { test, expect } from "@playwright/test";

const TEST_USER = {
  email: "test@example.com",
  password: "Test@123",
  name: "Test User",
};

test.describe("Authentication", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/signin");
  });

  test("should show sign in page", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Welcome back" })
    ).toBeVisible({ timeout: 5000 });
  });

  test("should show validation errors", async ({ page }) => {
    await page.getByLabel("Email").click();
    await page.getByLabel("Password").click();
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.getByText("Invalid email or password")).toBeVisible({
      timeout: 5000,
    });
  });

  test("should navigate to sign up page", async ({ page }) => {
    await page.getByText("Don't have an account? Sign up").click();
    await expect(page).toHaveURL("/auth/signup", { timeout: 5000 });
  });

  test("should handle successful sign in", async ({ page }) => {
    await page.getByLabel("Email").fill(TEST_USER.email);
    await page.getByLabel("Password").fill(TEST_USER.password);
    await page.getByRole("button", { name: "Sign In" }).click();

    // Check for success toast
    await expect(page.getByText("Signed in successfully")).toBeVisible({
      timeout: 5000,
    });

    // Should redirect to dashboard
    await expect(page).toHaveURL("/dashboard", { timeout: 5000 });
  });

  test("should handle invalid credentials", async ({ page }) => {
    await page.getByLabel("Email").fill("wrong@example.com");
    await page.getByLabel("Password").fill("WrongPass@123");
    await page.getByRole("button", { name: "Sign In" }).click();

    // Check for error toast
    await expect(page.getByText("Invalid email or password")).toBeVisible({
      timeout: 5000,
    });

    // Should stay on sign in page
    await expect(page).toHaveURL("/auth/signin", { timeout: 5000 });
  });
});
