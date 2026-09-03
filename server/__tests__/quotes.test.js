process.env.SUPABASE_URL = "https://test.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";

// Supabase's query builder is both chainable AND directly awaitable — no
// .then() call needed in the route code. This mock returns an object where
// every chain method returns itself, and awaiting it resolves to whatever
// `mockResult` currently holds. `mockLastBuilder` lets tests assert on
// exactly which chain methods the route called and with what arguments,
// since we can't verify real Postgres filtering without a real database —
// this only verifies the route wires up the right calls and handles the
// response shape/errors correctly.
//
// Names here are prefixed `mock` deliberately — Jest's jest.mock() factory
// below can only reference out-of-scope variables/functions named that way.
let mockResult = { data: [], error: null, count: 0 };
let mockLastBuilder = null;

function mockMakeChainable() {
  const builder = {
    select: jest.fn(() => builder),
    eq: jest.fn(() => builder),
    or: jest.fn(() => builder),
    order: jest.fn(() => builder),
    range: jest.fn(() => builder),
    not: jest.fn(() => builder),
    update: jest.fn(() => builder),
    delete: jest.fn(() => builder),
    single: jest.fn(() => builder),
    then: (resolve, reject) =>
      Promise.resolve(mockResult).then(resolve, reject),
  };
  mockLastBuilder = builder;
  return builder;
}

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => mockMakeChainable()),
  })),
}));

const request = require("supertest");
const app = require("../app");

beforeEach(() => {
  mockResult = { data: [], error: null, count: 0 };
  mockLastBuilder = null;
});

describe("GET /api/quotes", () => {
  test("always filters to approved-only content", async () => {
    await request(app).get("/api/quotes");
    expect(mockLastBuilder.eq).toHaveBeenCalledWith("is_approved", true);
  });

  test("wires book/source/favoriteOnly/sort params to the right query calls", async () => {
    await request(app).get(
      "/api/quotes?book=Dune&source=poetry-corner&favoriteOnly=true&sort=interactions",
    );

    expect(mockLastBuilder.eq).toHaveBeenCalledWith("book_title", "Dune");
    expect(mockLastBuilder.eq).toHaveBeenCalledWith(
      "source_channel",
      "poetry-corner",
    );
    expect(mockLastBuilder.eq).toHaveBeenCalledWith("is_admin_favorite", true);
    expect(mockLastBuilder.order).toHaveBeenCalledWith(
      "reaction_count",
      expect.objectContaining({ ascending: false }),
    );
  });

  test("wires the search param into an .or() text search", async () => {
    await request(app).get("/api/quotes?q=hello");
    expect(mockLastBuilder.or).toHaveBeenCalledWith(
      expect.stringContaining("quote_text.ilike.%hello%"),
    );
  });

  test("returns the quotes and total from the query result", async () => {
    mockResult = {
      data: [{ id: 1, quote_text: "A line worth keeping" }],
      error: null,
      count: 1,
    };

    const res = await request(app).get("/api/quotes");

    expect(res.status).toBe(200);
    expect(res.body.quotes).toEqual(mockResult.data);
    expect(res.body.total).toBe(1);
  });

  test("returns 500 when the query errors", async () => {
    mockResult = {
      data: null,
      error: { message: "connection failed" },
      count: null,
    };

    const res = await request(app).get("/api/quotes");

    expect(res.status).toBe(500);
  });
});

describe("GET /api/quotes/books", () => {
  test("filters out null book titles and dedupes/sorts the rest", async () => {
    mockResult = {
      data: [
        { book_title: "The Hobbit" },
        { book_title: "Dune" },
        { book_title: "The Hobbit" },
      ],
      error: null,
    };

    const res = await request(app).get("/api/quotes/books");

    expect(res.status).toBe(200);
    expect(res.body.books).toEqual(["Dune", "The Hobbit"]);
    expect(mockLastBuilder.not).toHaveBeenCalledWith("book_title", "is", null);
    expect(mockLastBuilder.eq).toHaveBeenCalledWith("is_approved", true);
  });

  test("returns 500 when the query errors", async () => {
    mockResult = { data: null, error: { message: "boom" } };

    const res = await request(app).get("/api/quotes/books");

    expect(res.status).toBe(500);
  });
});

describe("PATCH /api/quotes/:id/favorite", () => {
  test("requires an api key", async () => {
    const res = await request(app)
      .patch("/api/quotes/1/favorite")
      .send({ favorite: true });

    expect(res.status).toBe(401);
  });

  test("updates is_admin_favorite and returns the updated row", async () => {
    mockResult = {
      data: { id: "1", is_admin_favorite: true },
      error: null,
    };

    const res = await request(app)
      .patch("/api/quotes/1/favorite")
      .set("x-api-key", process.env.API_KEY)
      .send({ favorite: true });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockResult.data);
    expect(mockLastBuilder.update).toHaveBeenCalledWith({
      is_admin_favorite: true,
    });
    expect(mockLastBuilder.eq).toHaveBeenCalledWith("id", "1");
  });

  test("returns 500 when the update errors", async () => {
    mockResult = { data: null, error: { message: "boom" } };

    const res = await request(app)
      .patch("/api/quotes/1/favorite")
      .set("x-api-key", process.env.API_KEY)
      .send({ favorite: true });

    expect(res.status).toBe(500);
  });
});

describe("DELETE /api/quotes/:id", () => {
  test("requires an api key", async () => {
    const res = await request(app).delete("/api/quotes/1");
    expect(res.status).toBe(401);
  });

  test("deletes and returns 204", async () => {
    mockResult = { error: null };

    const res = await request(app)
      .delete("/api/quotes/1")
      .set("x-api-key", process.env.API_KEY);

    expect(res.status).toBe(204);
    expect(mockLastBuilder.eq).toHaveBeenCalledWith("id", "1");
  });

  test("returns 500 when the delete errors", async () => {
    mockResult = { error: { message: "boom" } };

    const res = await request(app)
      .delete("/api/quotes/1")
      .set("x-api-key", process.env.API_KEY);

    expect(res.status).toBe(500);
  });
});
