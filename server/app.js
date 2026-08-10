const express = require("express");
const cors = require("cors");
const multer = require("multer");
const compression = require("compression");
const { uploadsDir } = require("./config/cloudinary");

const membersRouter = require("./routes/members");
const authRouter = require("./routes/auth");
const adminRouter = require("./routes/admin");
const booksRouter = require("./routes/books");
const reviewsRouter = require("./routes/reviews");
const quotesRouter = require("./routes/quotes");
const activityRouter = require("./routes/activity");

const app = express();

// Trust Render's proxy so rate limiting keys off the real client IP,
// not the proxy's.
app.set("trust proxy", 1);

const allowedOrigin = process.env.FRONTEND_ORIGIN;
app.use(cors(allowedOrigin ? { origin: allowedOrigin } : {}));
app.use(express.json());
app.use(compression());

app.use(
  "/uploads",
  express.static(uploadsDir, { maxAge: "7d", immutable: true }),
);

app.use("/api/quotes", quotesRouter);
app.use("/api/members", membersRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/books", booksRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/activity", activityRouter);

// Turns multer/upload errors (bad file type, too large) into clean JSON
// instead of Express's default HTML error page.
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE" ? "Image must be under 5MB" : err.message;
    return res.status(400).json({ error: message });
  }
  if (err && err.message && err.message.includes("images are allowed")) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

module.exports = app;
