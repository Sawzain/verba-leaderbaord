const request = require("supertest");
const bcrypt = require("bcryptjs");
const app = require("../app");
const db = require("../test-utils/testDb");
const User = require("../models/User");

beforeAll(() => db.connect());
afterEach(() => db.clear());
afterAll(() => db.disconnect());

describe("GET /api/admin/verify", () => {
  test("requires an api key", async () => {
    const res = await request(app).get("/api/admin/verify");
    expect(res.status).toBe(401);
  });

  test("returns ok with a valid api key", async () => {
    const res = await request(app)
      .get("/api/admin/verify")
      .set("x-api-key", process.env.API_KEY);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});

// NOTE: POST /reset-password is behind authLimiter (max 10 requests per
// 15-minute window, keyed by IP, and it runs BEFORE requireApiKey — so
// even a rejected call still counts against the limit). This describe
// block deliberately makes only 5 calls to that route so it stays well
// under the threshold. If you add more tests here, keep the running
// total under 10, or a later test will start failing with a 429 that
// has nothing to do with the thing it's actually testing.
describe("POST /api/admin/reset-password", () => {
  test("requires an api key", async () => {
    const res = await request(app)
      .post("/api/admin/reset-password")
      .send({ email: "someone@example.com" });

    expect(res.status).toBe(401);
  });

  test("requires an email", async () => {
    const res = await request(app)
      .post("/api/admin/reset-password")
      .set("x-api-key", process.env.API_KEY)
      .send({});

    expect(res.status).toBe(400);
  });

  test("returns 404 for a nonexistent account", async () => {
    const res = await request(app)
      .post("/api/admin/reset-password")
      .set("x-api-key", process.env.API_KEY)
      .send({ email: "nobody@example.com" });

    expect(res.status).toBe(404);
  });

  test("resets the password and returns a temp password", async () => {
    const passwordHash = await bcrypt.hash("oldpassword123", 10);
    await User.create({
      name: "Reset Me",
      email: "reset@example.com",
      passwordHash,
    });

    const res = await request(app)
      .post("/api/admin/reset-password")
      .set("x-api-key", process.env.API_KEY)
      .send({ email: "reset@example.com" });

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("reset@example.com");
    expect(res.body.name).toBe("Reset Me");
    expect(res.body.tempPassword).toHaveLength(12);
  });

  test("the returned temp password actually logs the user in", async () => {
    const passwordHash = await bcrypt.hash("oldpassword123", 10);
    await User.create({
      name: "Login Check",
      email: "login-check@example.com",
      passwordHash,
    });

    const resetRes = await request(app)
      .post("/api/admin/reset-password")
      .set("x-api-key", process.env.API_KEY)
      .send({ email: "login-check@example.com" });

    const loginRes = await request(app).post("/api/auth/login").send({
      email: "login-check@example.com",
      password: resetRes.body.tempPassword,
    });

    expect(loginRes.status).toBe(200);
  });
});
