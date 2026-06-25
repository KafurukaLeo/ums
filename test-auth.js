
const { Client } = require('pg');

async function runTest() {
  const dbUrl = "postgresql://postgres:leo%40ABC2025%21%21@localhost:5432/university";
  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  // Clear existing test user if any
  await client.query("DELETE FROM users WHERE email = $1", ["testuser@example.com"]);

  console.log("1. Registering new user...");
  const registerRes = await fetch("http://localhost:3000/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test User",
      email: "testuser@example.com",
      password: "password123",
      role: "student"
    })
  });
  const registerData = await registerRes.json();
  console.log("Register Response:", registerData);

  console.log("\n2. Trying to log in before verification (should fail)...");
  const loginFailRes = await fetch("http://localhost:3000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "testuser@example.com",
      password: "password123"
    })
  });
  console.log("Login (Unverified) Status:", loginFailRes.status);
  const loginFailData = await loginFailRes.json();
  console.log("Login (Unverified) Response:", loginFailData);

  console.log("\n3. Fetching verification code from DB...");
  const dbRes = await client.query("SELECT * FROM users WHERE email = $1", ["testuser@example.com"]);
  const user = dbRes.rows[0];
  const code = user.emailVerificationToken;
  console.log("Verification code from DB:", code);

  console.log("\n4. Verifying email...");
  const verifyRes = await fetch("http://localhost:3000/auth/verify-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "testuser@example.com",
      token: code
    })
  });
  const verifyData = await verifyRes.json();
  console.log("Verify Response:", verifyData);

  console.log("\n5. Trying to log in after verification (should succeed)...");
  const loginSuccessRes = await fetch("http://localhost:3000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "testuser@example.com",
      password: "password123"
    })
  });
  console.log("Login (Verified) Status:", loginSuccessRes.status);
  const loginSuccessData = await loginSuccessRes.json();
  console.log("Login (Verified) Response:", loginSuccessData);

  console.log("\n6. Requesting password reset (forgot-password)...");
  const forgotRes = await fetch("http://localhost:3000/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "testuser@example.com"
    })
  });
  const forgotData = await forgotRes.json();
  console.log("Forgot Password Response:", forgotData);

  console.log("\n7. Fetching reset token from DB...");
  const dbResReset = await client.query("SELECT * FROM users WHERE email = $1", ["testuser@example.com"]);
  const userReset = dbResReset.rows[0];
  const resetToken = userReset.resetPasswordToken;
  console.log("Reset token from DB:", resetToken);

  console.log("\n8. Resetting password...");
  const resetRes = await fetch("http://localhost:3000/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "testuser@example.com",
      token: resetToken,
      newPassword: "newpassword456"
    })
  });
  const resetData = await resetRes.json();
  console.log("Reset Password Response:", resetData);

  console.log("\n9. Trying to log in with old password (should fail)...");
  const loginOldRes = await fetch("http://localhost:3000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "testuser@example.com",
      password: "password123"
    })
  });
  console.log("Login (Old Password) Status:", loginOldRes.status);
  const loginOldData = await loginOldRes.json();
  console.log("Login (Old Password) Response:", loginOldData);

  console.log("\n10. Trying to log in with new password (should succeed)...");
  const loginNewRes = await fetch("http://localhost:3000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "testuser@example.com",
      password: "newpassword456"
    })
  });
  console.log("Login (New Password) Status:", loginNewRes.status);
  const loginNewData = await loginNewRes.json();
  console.log("Login (New Password) Response:", loginNewData);

  // Clean up
  await client.query("DELETE FROM users WHERE email = $1", ["testuser@example.com"]);
  await client.end();
  console.log("\nTests completed successfully!");
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
