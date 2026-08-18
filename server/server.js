require("dotenv").config();
const mongoose = require("mongoose");

if (!process.env.MONGO_URI) {
  console.error(
    "Missing MONGO_URI environment variable. Copy .env.example to .env and fill in your connection string.",
  );
  process.exit(1);
}
if (!process.env.API_KEY) {
  console.error(
    "Missing API_KEY environment variable. Generate one with: openssl rand -hex 24",
  );
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error(
    "Missing JWT_SECRET environment variable. Generate one with: openssl rand -hex 32",
  );
  process.exit(1);
}
if (!process.env.CLOUDINARY_URL) {
  console.error(
    "Missing CLOUDINARY_URL environment variable. Render's disk is ephemeral, so " +
      "book covers are stored on Cloudinary instead. Get a free account at " +
      "cloudinary.com, then copy the 'API Environment variable' (starts with " +
      "cloudinary://...) from your dashboard into CLOUDINARY_URL.",
  );
  process.exit(1);
}
if (!process.env.RESEND_API_KEY) {
  console.warn(
    "RESEND_API_KEY not set — verification emails will be logged to the " +
      "console instead of sent. Set it in .env to actually send them.",
  );
}

// app.js reads process.env at module load (cloudinary.config, resend init),
// so it must be required only after the checks above have passed.
const app = require("./app");

// serverSelectionTimeoutMS: fail fast (5s) instead of Mongoose's 30s default
// if Atlas is unreachable, so a bad deploy or network issue surfaces in the
// Render logs quickly instead of hanging requests silently.
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

// Logs disconnects/reconnects after the initial connection — helps
// distinguish "never connected" from "was fine, then Atlas hiccuped."
mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
});
mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected");
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`),
);

// Render sends SIGTERM before killing a process on deploy/restart. Without
// handling it, in-flight requests can get cut off mid-response and the
// Mongo connection is torn down abruptly. This lets the HTTP server finish
// serving current requests, then closes Mongo cleanly before exiting.
function shutdown(signal) {
  console.log(`${signal} received, shutting down gracefully`);
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log("Closed out remaining connections");
      process.exit(0);
    });
  });

  // Force-exit if graceful shutdown takes too long (stuck connections, etc).
  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
