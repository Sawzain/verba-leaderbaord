const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const db = require("../test-utils/testDb");
const Book = require("../models/Book");
const Review = require("../models/Review");
const User = require("../models/User");
const Score = require("../Score");

function getCsrfToken(res) {
  const cookies = res.headers["set-cookie"] || [];
  const csrfCookie = cookies.find((c) => c.startsWith("verba_csrf="));
  if (!csrfCookie) return null;
  return decodeURIComponent(csrfCookie.split(";")[0].split("=")[1]);
}

beforeAll(() => db.connect());
afterEach(() => db.clear());
afterAll(() => db.disconnect());

describe("GET /api/books", () => {
  test("returns an empty paginated shape when no books exist", async () => {
    const res = await request(app).get("/api/books");

    expect(res.status).toBe(200);
    expect(res.body.books).toEqual([]);
    expect(res.body.total).toBe(0);
    expect(res.body.totalPages).toBe(1);
  });

  test("returns books with avgRating/reviewCount and paginates", async () => {
    for (let i = 0; i < 30; i++) {
      await Book.create({ title: `Book ${i}`, author: "Someone" });
    }

    const page1 = await request(app).get("/api/books?page=1&limit=24");
    expect(page1.status).toBe(200);
    expect(page1.body.books.length).toBe(24);
    expect(page1.body.total).toBe(30);
    expect(page1.body.totalPages).toBe(2);
    // No reviews yet — avgRating should be null, not 0 or NaN.
    expect(page1.body.books[0].avgRating).toBeNull();
    expect(page1.body.books[0].reviewCount).toBe(0);

    const page2 = await request(app).get("/api/books?page=2&limit=24");
    expect(page2.body.books.length).toBe(6);
  });
});

describe("GET /api/books/:id", () => {
  test("returns 404 for a nonexistent book", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/books/${fakeId}`);
    expect(res.status).toBe(404);
  });

  test("returns 400 for a malformed id", async () => {
    const res = await request(app).get("/api/books/not-a-valid-id");
    expect(res.status).toBe(400);
  });

  test("returns a book with reviews, avgRating, and reviewCount", async () => {
    const book = await Book.create({ title: "The Iliad", author: "Homer" });

    const res = await request(app).get(`/api/books/${book._id}`);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("The Iliad");
    expect(res.body.reviews).toEqual([]);
    expect(res.body.avgRating).toBeNull();
    expect(res.body.reviewCount).toBe(0);
  });
});

describe("POST /api/books", () => {
  test("requires an api key", async () => {
    const res = await request(app)
      .post("/api/books")
      .send({ title: "No Auth" });

    expect(res.status).toBe(401);
  });

  test("requires a title", async () => {
    const res = await request(app)
      .post("/api/books")
      .set("x-api-key", process.env.API_KEY)
      .send({ author: "Someone" });

    expect(res.status).toBe(400);
  });

  test("adds a new book with a valid api key", async () => {
    const res = await request(app)
      .post("/api/books")
      .set("x-api-key", process.env.API_KEY)
      .send({ title: "Dune", author: "Frank Herbert" });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Dune");
    expect(res.body.author).toBe("Frank Herbert");
  });

  test("rejects a duplicate title, case-insensitively", async () => {
    await Book.create({ title: "Dune", author: "Frank Herbert" });

    const res = await request(app)
      .post("/api/books")
      .set("x-api-key", process.env.API_KEY)
      .send({ title: "dune" });

    expect(res.status).toBe(409);
  });
});

describe("PUT /api/books/:id", () => {
  test("requires a title", async () => {
    const book = await Book.create({ title: "Original", author: "A" });

    const res = await request(app)
      .put(`/api/books/${book._id}`)
      .set("x-api-key", process.env.API_KEY)
      .send({ title: "" });

    expect(res.status).toBe(400);
  });

  test("returns 404 for a nonexistent book", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/books/${fakeId}`)
      .set("x-api-key", process.env.API_KEY)
      .send({ title: "Doesn't matter" });

    expect(res.status).toBe(404);
  });

  test("updates title and author", async () => {
    const book = await Book.create({
      title: "Old Title",
      author: "Old Author",
    });

    const res = await request(app)
      .put(`/api/books/${book._id}`)
      .set("x-api-key", process.env.API_KEY)
      .send({ title: "New Title", author: "New Author" });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("New Title");
    expect(res.body.author).toBe("New Author");
  });

  test("saving without changing the title doesn't trigger the duplicate check", async () => {
    const book = await Book.create({ title: "Same Title", author: "A" });

    const res = await request(app)
      .put(`/api/books/${book._id}`)
      .set("x-api-key", process.env.API_KEY)
      .send({ title: "Same Title", author: "B" });

    expect(res.status).toBe(200);
    expect(res.body.author).toBe("B");
  });

  test("rejects renaming to another book's title, case-insensitively", async () => {
    await Book.create({ title: "Existing Book", author: "A" });
    const book = await Book.create({ title: "This Book", author: "B" });

    const res = await request(app)
      .put(`/api/books/${book._id}`)
      .set("x-api-key", process.env.API_KEY)
      .send({ title: "existing book" });

    expect(res.status).toBe(409);
  });
});

describe("DELETE /api/books/:id", () => {
  test("returns 404 for a nonexistent book", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/books/${fakeId}`)
      .set("x-api-key", process.env.API_KEY);

    expect(res.status).toBe(404);
  });

  test("removes the book and cascades its reviews", async () => {
    const book = await Book.create({ title: "To Delete", author: "A" });
    await Review.create({
      book: book._id,
      user: new mongoose.Types.ObjectId(),
      rating: 4,
      text: "Fine.",
    });

    const res = await request(app)
      .delete(`/api/books/${book._id}`)
      .set("x-api-key", process.env.API_KEY);

    expect(res.status).toBe(204);
    expect(await Book.findById(book._id)).toBeNull();
    expect(await Review.countDocuments({ book: book._id })).toBe(0);
  });
});

describe("PATCH /api/books/:id/current-pick", () => {
  test("returns 404 for a nonexistent book", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .patch(`/api/books/${fakeId}/current-pick`)
      .set("x-api-key", process.env.API_KEY);

    expect(res.status).toBe(404);
  });

  test("setting a book as current pick stamps currentPickSetAt to now by default", async () => {
    const book = await Book.create({ title: "Pick Me", author: "A" });

    const res = await request(app)
      .patch(`/api/books/${book._id}/current-pick`)
      .set("x-api-key", process.env.API_KEY)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.isCurrentPick).toBe(true);
    expect(res.body.currentPickSetAt).toBeTruthy();
  });

  test("accepts a backdated currentPickSetAt", async () => {
    const book = await Book.create({ title: "Pick Me", author: "A" });
    const backdate = "2026-01-15T00:00:00.000Z";

    const res = await request(app)
      .patch(`/api/books/${book._id}/current-pick`)
      .set("x-api-key", process.env.API_KEY)
      .send({ currentPickSetAt: backdate });

    expect(res.status).toBe(200);
    expect(new Date(res.body.currentPickSetAt).toISOString()).toBe(backdate);
  });

  test("setting one book as current pick clears the flag on all others", async () => {
    const first = await Book.create({
      title: "First Pick",
      author: "A",
      isCurrentPick: true,
      currentPickSetAt: new Date(),
    });
    const second = await Book.create({ title: "Second Pick", author: "B" });

    await request(app)
      .patch(`/api/books/${second._id}/current-pick`)
      .set("x-api-key", process.env.API_KEY)
      .send({});

    const refreshedFirst = await Book.findById(first._id);
    expect(refreshedFirst.isCurrentPick).toBe(false);
    expect(refreshedFirst.currentPickSetAt).toBeNull();
  });

  test("toggling off clears currentPickSetAt", async () => {
    const book = await Book.create({
      title: "Toggle Off",
      author: "A",
      isCurrentPick: true,
      currentPickSetAt: new Date(),
    });

    const res = await request(app)
      .patch(`/api/books/${book._id}/current-pick`)
      .set("x-api-key", process.env.API_KEY)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.isCurrentPick).toBe(false);
    expect(res.body.currentPickSetAt).toBeNull();
  });
});

describe("POST /api/books/:id/reviews", () => {
  test("requires auth", async () => {
    const book = await Book.create({ title: "Needs Auth", author: "A" });

    const res = await request(app)
      .post(`/api/books/${book._id}/reviews`)
      .send({ rating: 5, text: "Great" });

    expect(res.status).toBe(401);
  });

  test("creates a review and returns 201-shaped review data", async () => {
    const book = await Book.create({ title: "Dune", author: "Frank Herbert" });

    const agent = request.agent(app);
    const registerRes = await agent.post("/api/auth/register").send({
      name: "Reviewer",
      email: "reviewer@example.com",
      password: "password123",
    });
    await User.updateOne(
      { email: "reviewer@example.com" },
      { emailVerified: true },
    );
    const csrfToken = getCsrfToken(registerRes);

    const res = await agent
      .post(`/api/books/${book._id}/reviews`)
      .set("X-CSRF-Token", csrfToken)
      .send({ rating: 4, text: "Enjoyed it." });

    expect(res.status).toBe(200);
    expect(res.body.rating).toBe(4);
    expect(res.body.text).toBe("Enjoyed it.");
    expect(res.body.reviewer).toBe("Reviewer");
    expect(res.body.edited).toBe(false);
  });

  test.each([0, 6, undefined])("rejects an out-of-range rating (%p)", async (rating) => {
    const book = await Book.create({ title: "Rating Test", author: "A" });

    const agent = request.agent(app);
    const registerRes = await agent.post("/api/auth/register").send({
      name: "Reviewer",
      email: "rating@example.com",
      password: "password123",
    });
    await User.updateOne(
      { email: "rating@example.com" },
      { emailVerified: true },
    );
    const csrfToken = getCsrfToken(registerRes);

    const res = await agent
      .post(`/api/books/${book._id}/reviews`)
      .set("X-CSRF-Token", csrfToken)
      .send({ rating, text: "Doesn't matter" });

    expect(res.status).toBe(400);
  });

  test("rejects a second review from the same user for the same book", async () => {
    const book = await Book.create({ title: "One Review Only", author: "A" });

    const agent = request.agent(app);
    const registerRes = await agent.post("/api/auth/register").send({
      name: "Reviewer",
      email: "dupe-review@example.com",
      password: "password123",
    });
    await User.updateOne(
      { email: "dupe-review@example.com" },
      { emailVerified: true },
    );
    const csrfToken = getCsrfToken(registerRes);

    const first = await agent
      .post(`/api/books/${book._id}/reviews`)
      .set("X-CSRF-Token", csrfToken)
      .send({ rating: 5, text: "First review" });
    expect(first.status).toBe(200);

    const second = await agent
      .post(`/api/books/${book._id}/reviews`)
      .set("X-CSRF-Token", csrfToken)
      .send({ rating: 3, text: "Second attempt" });

    expect(second.status).toBe(409);
  });

  test("links the review to a Score entry when the reviewer's account is linked", async () => {
    const book = await Book.create({ title: "Linked Reviewer", author: "A" });

    const agent = request.agent(app);
    const registerRes = await agent.post("/api/auth/register").send({
      name: "Reviewer",
      email: "linked@example.com",
      password: "password123",
    });
    const user = await User.findOneAndUpdate(
      { email: "linked@example.com" },
      { emailVerified: true },
      { new: true },
    );
    const score = await Score.create({
      username: "Reviewer",
      score: 0,
      userId: user._id,
    });
    const csrfToken = getCsrfToken(registerRes);

    const res = await agent
      .post(`/api/books/${book._id}/reviews`)
      .set("X-CSRF-Token", csrfToken)
      .send({ rating: 5, text: "Linked!" });

    expect(res.status).toBe(200);
    expect(res.body.memberId).toBe(score._id.toString());
  });
});
