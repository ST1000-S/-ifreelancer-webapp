import { test, expect } from "@playwright/test";

test.describe("Jobs", () => {
  test("should show job search section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByPlaceholder("Search jobs...")).toBeVisible();
    await expect(
      page.getByRole("combobox", { name: "Job type" })
    ).toBeVisible();
  });

  test("should filter jobs", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("Search jobs...").fill("React");
    await page.getByRole("button", { name: "Search" }).click();
    // Wait for the search results
    await page.waitForResponse(
      (response) =>
        response.url().includes("/api/jobs") && response.status() === 200
    );
  });

  test("should validate budget inputs", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("Min Budget").fill("1000");
    await page.getByPlaceholder("Max Budget").fill("500");
    await page.getByRole("button", { name: "Search" }).click();
    await expect(
      page.getByText("Minimum budget cannot be greater than maximum budget")
    ).toBeVisible();
  });
});
