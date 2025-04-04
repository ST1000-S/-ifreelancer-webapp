/**
 * iFreelancer API Tests
 *
 * This script tests the basic API endpoints of the iFreelancer application
 * Run with: node tests/api-tests.js
 */

const fetch = require("node-fetch");

const BASE_URL = "http://localhost:3000/api";
let authToken = null;

// Test user credentials
const TEST_USER = {
  email: "test-api@example.com",
  password: "Password123!",
  name: "API Test User",
  role: "CLIENT",
};

// Test job data
const TEST_JOB = {
  title: "Test Job from API Tests",
  description: "This is a test job created by automated tests",
  type: "REMOTE",
  budget: 5000,
  category: "WEB_DEVELOPMENT",
  skills: ["JavaScript", "React", "API Testing"],
};

let createdJobId = null;

/**
 * Helper function to make API requests
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (authToken && !options.skipAuth) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (options.returnRawResponse) {
    return response;
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const data = await response.json();
    return { status: response.status, data };
  }

  const text = await response.text();
  return { status: response.status, text };
}

/**
 * Helper to log test results
 */
function logTest(name, success, details = "") {
  const status = success ? "✅ PASS" : "❌ FAIL";
  console.log(`${status} - ${name} ${details}`);
}

/**
 * Test functions
 */
async function testSignUp() {
  try {
    const response = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(TEST_USER),
      skipAuth: true,
    });

    // Account might already exist, both 201 and 409 are acceptable
    const success = response.status === 201 || response.status === 409;
    logTest(
      "User Registration",
      success,
      response.status === 409 ? "(User already exists)" : ""
    );
    return success;
  } catch (error) {
    console.error("Error during signup test:", error);
    logTest("User Registration", false, error.message);
    return false;
  }
}

async function testSignIn() {
  try {
    const response = await apiRequest("/auth/signin", {
      method: "POST",
      body: JSON.stringify({
        email: TEST_USER.email,
        password: TEST_USER.password,
      }),
      skipAuth: true,
    });

    const success = response.status === 200 && response.data?.token;
    if (success) {
      authToken = response.data.token;
    }
    logTest("User Authentication", success);
    return success;
  } catch (error) {
    console.error("Error during signin test:", error);
    logTest("User Authentication", false, error.message);
    return false;
  }
}

async function testCreateJob() {
  if (!authToken) {
    logTest("Create Job", false, "No auth token available");
    return false;
  }

  try {
    const response = await apiRequest("/jobs", {
      method: "POST",
      body: JSON.stringify(TEST_JOB),
    });

    const success = response.status === 201 && response.data?.id;
    if (success) {
      createdJobId = response.data.id;
    }
    logTest("Create Job", success);
    return success;
  } catch (error) {
    console.error("Error during job creation test:", error);
    logTest("Create Job", false, error.message);
    return false;
  }
}

async function testGetJobs() {
  try {
    const response = await apiRequest("/jobs", {
      method: "GET",
      skipAuth: true,
    });

    const success =
      response.status === 200 && Array.isArray(response.data?.jobs);
    logTest(
      "Get Jobs",
      success,
      `Found ${response.data?.jobs?.length || 0} jobs`
    );
    return success;
  } catch (error) {
    console.error("Error during get jobs test:", error);
    logTest("Get Jobs", false, error.message);
    return false;
  }
}

async function testUpdateJob() {
  if (!createdJobId) {
    logTest("Update Job", false, "No job ID available");
    return false;
  }

  try {
    const updatedData = {
      ...TEST_JOB,
      title: `${TEST_JOB.title} (Updated)`,
      budget: TEST_JOB.budget + 1000,
    };

    const response = await apiRequest(`/jobs`, {
      method: "PUT",
      body: JSON.stringify({
        id: createdJobId,
        ...updatedData,
      }),
    });

    const success =
      response.status === 200 && response.data?.title === updatedData.title;
    logTest("Update Job", success);
    return success;
  } catch (error) {
    console.error("Error during job update test:", error);
    logTest("Update Job", false, error.message);
    return false;
  }
}

async function testGetProfile() {
  try {
    const response = await apiRequest("/profile", {
      method: "GET",
    });

    const success =
      response.status === 200 && response.data?.email === TEST_USER.email;
    logTest("Get Profile", success);
    return success;
  } catch (error) {
    console.error("Error during get profile test:", error);
    logTest("Get Profile", false, error.message);
    return false;
  }
}

async function testDeleteJob() {
  if (!createdJobId) {
    logTest("Delete Job", false, "No job ID available");
    return false;
  }

  try {
    const response = await apiRequest(`/jobs?id=${createdJobId}`, {
      method: "DELETE",
    });

    const success = response.status === 200;
    logTest("Delete Job", success);
    return success;
  } catch (error) {
    console.error("Error during job deletion test:", error);
    logTest("Delete Job", false, error.message);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log("🧪 Starting API Tests for iFreelancer");
  console.log("======================================");

  const signUpResult = await testSignUp();
  const signInResult = await testSignIn();

  if (!signInResult) {
    console.log("❌ Authentication failed, skipping remaining tests");
    return;
  }

  await testGetProfile();
  const createJobResult = await testCreateJob();
  await testGetJobs();

  if (createJobResult) {
    await testUpdateJob();
    await testDeleteJob();
  }

  console.log("======================================");
  console.log("🏁 API Tests completed");
}

// Run the tests
runTests().catch((err) => {
  console.error("Error running tests:", err);
});
