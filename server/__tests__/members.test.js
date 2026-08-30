const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const db = require("../test-utils/testDb");
const Score = require("../Score");

beforeAll(() => db.connect());
afterEach(() => db.clear());
afterAll(() => db.disconnect());

describe("GET /api/members (legacy full-list mode)", () => {
  test("returns the full roster as a plain array when no page/limit given", async () => {
    await Score.create({ username: "Alice", score: 3 });
    await Score.create({ username: "Bob", score: 1 });

    const res = await request(app).get("/api/members");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    // Legacy mode has no pagination wrapper.
    expect(res.body.total).toBeUndefined();
  });
});

describe("GET /api/members (paginated + ranked mode)", () => {
  test("paginates and reports total/totalPages", async () => {
    for (let i = 0; i < 15; i++) {
      await Score.create({ username: `Member${i}`, score: 15 - i });
    }

    const page1 = await request(app).get("/api/members?page=1&limit=10");
    expect(page1.status).toBe(200);
    expect(page1.body.members.length).toBe(10);
    expect(page1.body.total).toBe(15);
    expect(page1.body.totalPages).toBe(2);
    expect(page1.body.members[0].rank).toBe(1);

    const page2 = await request(app).get("/api/members?page=2&limit=10");
    expect(page2.body.members.length).toBe(5);
    // Page 2 continues the rank sequence rather than restarting at 1.
    expect(page2.body.members[0].rank).toBe(11);
  });

  test("tied scores share the same rank", async () => {
    await Score.create({ username: "Alice", score: 5 });
    await Score.create({ username: "Bob", score: 5 });
    await Score.create({ username: "Carol", score: 3 });

    const res = await request(app).get("/api/members?page=1&limit=10");
    const byName = Object.fromEntries(
      res.body.members.map((m) => [m.username, m]),
    );

    expect(byName.Alice.rank).toBe(1);
    expect(byName.Bob.rank).toBe(1);
    expect(byName.Carol.rank).toBe(3);
  });
});

describe("POST /api/members", () => {
  test("requires an api key", async () => {
    const res = await request(app)
      .post("/api/members")
      .send({ username: "NoAuth" });

    expect(res.status).toBe(401);
  });

  test("adds a new member with a valid api key", async () => {
    const res = await request(app)
      .post("/api/members")
      .set("x-api-key", process.env.API_KEY)
      .send({ username: "NewMember", score: 2 });

    expect(res.status).toBe(200);
    expect(res.body.username).toBe("NewMember");
    expect(res.body.score).toBe(2);
  });

  test("rejects a duplicate name, case-insensitively", async () => {
    await Score.create({ username: "Sam", score: 0 });

    const res = await request(app)
      .post("/api/members")
      .set("x-api-key", process.env.API_KEY)
      .send({ username: "sam" });

    expect(res.status).toBe(409);
  });

  test("requires a name", async () => {
    const res = await request(app)
      .post("/api/members")
      .set("x-api-key", process.env.API_KEY)
      .send({});

    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/members/:id", () => {
  test("removes an existing member", async () => {
    const member = await Score.create({ username: "ToRemove", score: 0 });

    const res = await request(app)
      .delete(`/api/members/${member._id}`)
      .set("x-api-key", process.env.API_KEY);

    expect(res.status).toBe(204);
    expect(await Score.findById(member._id)).toBeNull();
  });

  test("returns 404 for a nonexistent member", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .delete(`/api/members/${fakeId}`)
      .set("x-api-key", process.env.API_KEY);

    expect(res.status).toBe(404);
  });
});

describe("PUT /api/members/:id", () => {
  test("updates a member's score", async () => {
    const member = await Score.create({ username: "ScoreTest", score: 3 });

    const res = await request(app)
      .put(`/api/members/${member._id}`)
      .set("x-api-key", process.env.API_KEY)
      .send({ score: 5 });

    expect(res.status).toBe(200);
    expect(res.body.score).toBe(5);
  });

  test("returns 404 for a nonexistent member", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .put(`/api/members/${fakeId}`)
      .set("x-api-key", process.env.API_KEY)
      .send({ score: 5 });

    expect(res.status).toBe(404);
  });
});
