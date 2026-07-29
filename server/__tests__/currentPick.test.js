const request = require("supertest");
const app = require("../app");
const db = require("../test-utils/testDb");
const Book = require("../models/Book");

beforeAll(() => db.connect());
afterEach(() => db.clear());
afterAll(() => db.disconnect());

test("setting a book as current pick clears any previous pick", async () => {
  const bookA = await Book.create({ title: "Book A", isCurrentPick: true });
  const bookB = await Book.create({ title: "Book B" });

  const res = await request(app)
    .patch(`/api/books/${bookB._id}/current-pick`)
    .set("x-api-key", process.env.API_KEY);

  expect(res.status).toBe(200);
  expect(res.body.isCurrentPick).toBe(true);

  const refreshedA = await Book.findById(bookA._id);
  const refreshedB = await Book.findById(bookB._id);
  expect(refreshedA.isCurrentPick).toBe(false);
  expect(refreshedB.isCurrentPick).toBe(true);
});
