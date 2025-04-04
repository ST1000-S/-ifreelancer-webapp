import fetch from "node-fetch";

async function testRateLimit() {
  console.log("Making 70 requests to test rate limiting...");
  const results = {
    successful: 0,
    rateLimited: 0,
  };

  for (let i = 1; i <= 70; i++) {
    try {
      const response = await fetch("http://localhost:3000/api/test-rate-limit");
      const headers = {
        limit: response.headers.get("x-ratelimit-limit"),
        remaining: response.headers.get("x-ratelimit-remaining"),
        reset: response.headers.get("x-ratelimit-reset"),
      };

      console.log(`Request ${i}: Status: ${response.status}`);
      console.log("Headers:", headers);

      if (response.status === 429) {
        console.log("Rate limited!");
        results.rateLimited++;
      } else {
        results.successful++;
        const data = await response.json();
        console.log("Response:", JSON.stringify(data, null, 2));
      }
    } catch (error) {
      console.log(`Request ${i} failed:`, error.message);
    }

    // Small delay between requests to avoid overwhelming the server
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log("\nTest Results:");
  console.log("Successful requests:", results.successful);
  console.log("Rate limited requests:", results.rateLimited);
}

testRateLimit().catch((error) => {
  console.error("Test failed:", error);
  process.exit(1);
});
