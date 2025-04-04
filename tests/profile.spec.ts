import { test, expect } from "@playwright/test";

const testUser = {
  email: "test@example.com",
  password: "Test@123",
};

const profileData = {
  fullName: "John Doe",
  title: "Senior Full Stack Developer",
  bio: "Experienced developer with 8 years of industry experience",
  hourlyRate: "75",
  skills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
  education: {
    institution: "University of Technology",
    degree: "Bachelor of Computer Science",
    graduationYear: "2019",
  },
  certification: {
    name: "AWS Certified Developer",
    issuer: "Amazon Web Services",
    issueDate: "2023-01",
    expiryDate: "2026-01",
  },
};

test.describe("Profile Management", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/auth/signin");
    await page.getByLabel("Email").fill(testUser.email);
    await page.getByLabel("Password").fill(testUser.password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL("/dashboard");
  });

  test("should display profile page", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible();
  });

  test("should update basic profile information", async ({ page }) => {
    await page.goto("/profile");
    await page.getByLabel("Full Name").fill(profileData.fullName);
    await page.getByLabel("Professional Title").fill(profileData.title);
    await page.getByLabel("Bio").fill(profileData.bio);
    await page.getByLabel("Hourly Rate").fill(profileData.hourlyRate);
    await page.getByRole("button", { name: /save changes/i }).click();

    // Verify changes were saved
    await page.reload();
    await expect(page.getByLabel("Full Name")).toHaveValue(
      profileData.fullName
    );
    await expect(page.getByLabel("Professional Title")).toHaveValue(
      profileData.title
    );
  });

  test("should manage skills", async ({ page }) => {
    await page.goto("/profile");

    // Add skills
    for (const skill of profileData.skills) {
      await page.getByLabel("Add Skill").fill(skill);
      await page.keyboard.press("Enter");
    }

    // Verify skills are displayed
    for (const skill of profileData.skills) {
      await expect(page.getByText(skill)).toBeVisible();
    }

    // Remove a skill
    await page.getByText(profileData.skills[0]).getByRole("button").click();
    await expect(page.getByText(profileData.skills[0])).not.toBeVisible();
  });

  test("should add education history", async ({ page }) => {
    await page.goto("/profile/education");
    await page.getByRole("button", { name: /add education/i }).click();

    await page
      .getByLabel("Institution")
      .fill(profileData.education.institution);
    await page.getByLabel("Degree").fill(profileData.education.degree);
    await page
      .getByLabel("Graduation Year")
      .fill(profileData.education.graduationYear);
    await page.getByRole("button", { name: /save/i }).click();

    // Verify education was added
    await expect(
      page.getByText(profileData.education.institution)
    ).toBeVisible();
    await expect(page.getByText(profileData.education.degree)).toBeVisible();
  });

  test("should add certification", async ({ page }) => {
    await page.goto("/profile/certifications");
    await page.getByRole("button", { name: /add certification/i }).click();

    await page
      .getByLabel("Certification Name")
      .fill(profileData.certification.name);
    await page
      .getByLabel("Issuing Organization")
      .fill(profileData.certification.issuer);
    await page
      .getByLabel("Issue Date")
      .fill(profileData.certification.issueDate);
    await page
      .getByLabel("Expiry Date")
      .fill(profileData.certification.expiryDate);
    await page.getByRole("button", { name: /save/i }).click();

    // Verify certification was added
    await expect(page.getByText(profileData.certification.name)).toBeVisible();
    await expect(
      page.getByText(profileData.certification.issuer)
    ).toBeVisible();
  });

  test("should validate profile inputs", async ({ page }) => {
    await page.goto("/profile");

    // Test hourly rate validation
    await page.getByLabel("Hourly Rate").fill("-50");
    await page.getByRole("button", { name: /save changes/i }).click();
    await expect(
      page.getByText("Hourly rate must be a positive number")
    ).toBeVisible();

    // Test required fields
    await page.getByLabel("Full Name").fill("");
    await page.getByRole("button", { name: /save changes/i }).click();
    await expect(page.getByText("Full name is required")).toBeVisible();
  });

  test("should handle profile image upload", async ({ page }) => {
    await page.goto("/profile");

    // Setup file input for upload
    await page.setInputFiles(
      'input[type="file"]',
      "tests/fixtures/profile-image.jpg"
    );
    await expect(page.getByText("Image uploaded successfully")).toBeVisible();

    // Verify image is displayed
    const imgElement = page.getByRole("img", { name: "Profile picture" });
    await expect(imgElement).toBeVisible();
  });
});
