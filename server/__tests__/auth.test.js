const request = require("supertest");
const bcrypt = require("bcryptjs");
const app = require("../app");
const db = require("../test-utils/testDb");
const User = require("../models/User");

beforeAll(() => db.connect());
afterEach(() => db.clear());
afterAll(() => db.disconnect());

describe("POST /api/auth/register", () => {
  test("creates a new account and sets a session cookie", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Alex",
      email: "alex@example.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.headers["set-cookie"]).toBeTruthy();
    expect(res.body.user.email).toBe("alex@example.com");
    expect(res.body.user.isAdmin).toBe(false);
  });

  test("rejects a duplicate email", async () => {
    await User.create({
      name: "Existing",
      email: "dupe@example.com",
      passwordHash: "hash",
    });

    const res = await request(app).post("/api/auth/register").send({
      name: "New",
      email: "dupe@example.com",
      password: "password123",
    });

    expect(res.status).toBe(409);
  });

  test("rejects a password under 8 characters", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Alex",
      email: "alex2@example.com",
      password: "short",
    });

    expect(res.status).toBe(400);
  });

  test("requires name, email, and password", async () => {
    const res = await request(app).post("/api/auth/register").send({});
    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  test("logs in with correct credentials", async () => {
    const passwordHash = await bcrypt.hash("password123", 10);
    await User.create({
      name: "Alex",
      email: "alex@example.com",
      passwordHash,
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "alex@example.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.headers["set-cookie"]).toBeTruthy();
    expect(res.body.user.email).toBe("alex@example.com");
  });

  test("rejects the wrong password", async () => {
    const passwordHash = await bcrypt.hash("password123", 10);
    await User.create({
      name: "Alex",
      email: "alex@example.com",
      passwordHash,
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "alex@example.com",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
  });

  test("rejects a nonexistent email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@example.com",
      password: "password123",
    });

    expect(res.status).toBe(401);
  });
});

describe("GET /api/auth/me", () => {
  test("rejects a request with no session", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  test("rejects an invalid session cookie", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Cookie", "verba_token=not-a-real-token");

    expect(res.status).toBe(401);
  });

  test("returns the logged-in user's info with a valid session", async () => {
    // request.agent persists cookies across calls, like a real browser —
    // needed here since the session now lives in an httpOnly cookie set
    // by /register rather than a token in the response body.
    const agent = request.agent(app);
    await agent.post("/api/auth/register").send({
      name: "Alex",
      email: "alex@example.com",
      password: "password123",
    });

    const res = await agent.get("/api/auth/me");

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("alex@example.com");
    expect(res.body.name).toBe("Alex");
  });
});
