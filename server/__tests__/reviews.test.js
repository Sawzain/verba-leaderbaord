const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");
const db = require("../test-utils/testDb");
const User = require("../models/User");
const Book = require("../models/Book");
const Review = require("../models/Review");

function tokenFor(user) {
  return jwt.sign(
    { sub: user._id.toString(), name: user.name, isAdmin: !!user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );
}

beforeAll(() => db.connect());
afterEach(() => db.clear());
afterAll(() => db.disconnect());

async function makeUser(overrides = {}) {
  return User.create({
    name: "Reader One",
    email: `reader-${Date.now()}-${Math.random()}@example.com`,
    passwordHash: "irrelevant",
    ...overrides,
  });
}

describe("reviews", () => {
  test("a member can't submit two reviews for the same book", async () => {
    const user = await makeUser();
    const book = await Book.create({ title: "Test Book" });
    const token = tokenFor(user);

    const first = await request(app)
      .post(`/api/books/${book._id}/reviews`)
      .set("Authorization", `Bearer ${token}`)
      .send({ rating: 4, text: "Good" });
    expect(first.status).toBe(200);

    const second = await request(app)
      .post(`/api/books/${book._id}/reviews`)
      .set("Authorization", `Bearer ${token}`)
      .send({ rating: 5, text: "Actually great" });
    expect(second.status).toBe(409);
  });

  test("a member cannot edit or delete someone else's review", async () => {
    const author = await makeUser({ name: "Author" });
    const other = await makeUser({ name: "Someone Else" });
    const book = await Book.create({ title: "Test Book" });
    const review = await Review.create({
      book: book._id,
      user: author._id,
      rating: 3,
      text: "Fine",
    });
    const otherToken = tokenFor(other);

    const editRes = await request(app)
      .put(`/api/reviews/${review._id}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ rating: 1 });
    expect(editRes.status).toBe(403);

    const deleteRes = await request(app)
      .delete(`/api/reviews/${review._id}`)
      .set("Authorization", `Bearer ${otherToken}`);
    expect(deleteRes.status).toBe(403);
  });

  test("an admin account can remove someone else's review", async () => {
    const author = await makeUser({ name: "Author" });
    const admin = await makeUser({ name: "Admin", isAdmin: true });
    const book = await Book.create({ title: "Test Book" });
    const review = await Review.create({
      book: book._id,
      user: author._id,
      rating: 2,
      text: "Meh",
    });
    const adminToken = tokenFor(admin);

    const res = await request(app)
      .delete(`/api/reviews/${review._id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });

  test("editing a review marks it as edited", async () => {
    const author = await makeUser({ name: "Author" });
    const book = await Book.create({ title: "Test Book" });
    const review = await Review.create({
      book: book._id,
      user: author._id,
      rating: 3,
      text: "Fine",
    });
    const token = tokenFor(author);

    await request(app)
      .put(`/api/reviews/${review._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "Actually, changed my mind" });

    const bookRes = await request(app).get(`/api/books/${book._id}`);
    expect(bookRes.body.reviews[0].edited).toBe(true);
  });
});
