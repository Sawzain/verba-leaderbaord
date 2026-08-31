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

// Builds a manually-signed session for a user, without going through the
// real /login flow. Session auth now lives in an httpOnly cookie rather
// than an Authorization header, so the JWT has to be attached as a
// Cookie. It also has to include a matching CSRF cookie + header — a
// real login sets both together (see setAuthCookies in
// server/utils/authCookies.js), but since this bypasses login, both
// need to be supplied by hand here or the csrf middleware rejects every
// POST/PUT/DELETE below with a 403.
function sessionFor(user) {
  const csrfToken = "test-csrf-token";
  return {
    cookie: `verba_token=${tokenFor(user)}; verba_csrf=${csrfToken}`,
    csrfHeader: csrfToken,
  };
}

function withSession(req, user) {
  const session = sessionFor(user);
  return req.set("Cookie", session.cookie).set("X-CSRF-Token", session.csrfHeader);
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

    const first = await withSession(
      request(app).post(`/api/books/${book._id}/reviews`),
      user,
    ).send({ rating: 4, text: "Good" });
    expect(first.status).toBe(200);

    const second = await withSession(
      request(app).post(`/api/books/${book._id}/reviews`),
      user,
    ).send({ rating: 5, text: "Actually great" });
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

    const editRes = await withSession(
      request(app).put(`/api/reviews/${review._id}`),
      other,
    ).send({ rating: 1 });
    expect(editRes.status).toBe(403);

    const deleteRes = await withSession(
      request(app).delete(`/api/reviews/${review._id}`),
      other,
    );
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

    const res = await withSession(
      request(app).delete(`/api/reviews/${review._id}`),
      admin,
    );
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

    await withSession(
      request(app).put(`/api/reviews/${review._id}`),
      author,
    ).send({ text: "Actually, changed my mind" });

    const bookRes = await request(app).get(`/api/books/${book._id}`);
    expect(bookRes.body.reviews[0].edited).toBe(true);
  });
});
