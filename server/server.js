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

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
