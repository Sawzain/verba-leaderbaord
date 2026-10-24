// Email auth is off by default in production. setupEnv.js turns it on for
// the other test files, so this one switches it back off before the app
// loads (the flag is read when routes/auth.js is first required).
process.env.EMAIL_AUTH_ENABLED = "false";

const request = require("supertest");
const app = require("../app");

describe("email auth switched off", () => {
  test.each([
    [
      "/api/auth/register",
      { name: "Alex", email: "alex@example.com", password: "password123" },
    ],
    ["/api/auth/login", { email: "alex@example.com", password: "password123" }],
    ["/api/auth/forgot-password", { email: "alex@example.com" }],
    ["/api/auth/reset-password", { token: "x", password: "password123" }],
  ])("POST %s returns 403", async (path, body) => {
    const res = await request(app).post(path).send(body);
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/turned off/i);
  });
});
