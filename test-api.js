const fetch = require("node-fetch");

async function testSignup() {
  try {
    const response = await fetch("http://localhost:3000/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "Test@123456",
        name: "Test User",
        role: "FREELANCER",
      }),
    });

    const data = await response.json();
    console.log("Signup response:", data);
  } catch (error) {
    console.error("Error:", error);
  }
}

async function testSignin() {
  try {
    const response = await fetch("http://localhost:3000/api/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "Test@123456",
      }),
    });

    const data = await response.json();
    console.log("Signin response:", data);
  } catch (error) {
    console.error("Error:", error);
  }
}

testSignup().then(() => testSignin());
