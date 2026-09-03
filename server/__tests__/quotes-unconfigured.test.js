// Deliberately does NOT set SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY, so
// SUPABASE_CONFIGURED evaluates to false, exercising the fallback path
// every quotes route takes in that state — untested until now, and it's
// actually the CURRENT default in this project's test/dev environment
// per setupEnv.js.
const request = require("supertest");
const app = require("../app");

describe("Quotes routes when Supabase isn't configured", () => {
  test("GET / returns 503, not a crash", async () => {
    const res = await request(app).get("/api/quotes");
    expect(res.status).toBe(503);
  });

  test("GET /books returns 503", async () => {
    const res = await request(app).get("/api/quotes/books");
    expect(res.status).toBe(503);
  });

  test("PATCH /:id/favorite returns 503 (after passing the api key check)", async () => {
    const res = await request(app)
      .patch("/api/quotes/1/favorite")
      .set("x-api-key", process.env.API_KEY)
      .send({ favorite: true });

    expect(res.status).toBe(503);
  });

  test("DELETE /:id returns 503 (after passing the api key check)", async () => {
    const res = await request(app)
      .delete("/api/quotes/1")
      .set("x-api-key", process.env.API_KEY);

    expect(res.status).toBe(503);
  });
});
