const path = require("path");
const fs = require("fs");
const multer = require("multer");
const sharp = require("sharp");
const { v2: cloudinary } = require("cloudinary");

// cloudinary.config() picks up CLOUDINARY_URL from the environment
// automatically, but calling it explicitly makes that dependency obvious
// here instead of implicit magic.
cloudinary.config({ secure: true });

// Covers live on Cloudinary, not Render's disk. Render's free tier disk is
// ephemeral — anything written to it disappears on the next deploy or
// restart — so storing covers locally meant they'd vanish unpredictably.
// This directory is kept only so any covers uploaded *before* this
// migration (still pointing at "/uploads/xxx.jpg") keep working until
// they're naturally replaced.
const uploadsDir = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, WEBP, or GIF images are allowed"));
    }
    cb(null, true);
  },
});

// Cover photos are often straight off a phone camera (several MB, wrong
// orientation baked into EXIF instead of pixels). This resizes to a
// sensible display width and re-encodes as compressed JPEG, then uploads
// the result to Cloudinary, which is where the file actually lives
// permanently. Returns the public URL and the public_id (needed later to
// delete the asset when the book is removed).
async function saveCoverImage(fileBuffer) {
  const processed = await sharp(fileBuffer)
    .rotate() // apply EXIF orientation, then strip it
    .resize({ width: 600, withoutEnlargement: true })
    .jpeg({ quality: 78 })
    .toBuffer();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "verba-covers",
        resource_type: "image",
      },
      (err, result) => {
        if (err) return reject(err);
        // f_auto,q_auto: Cloudinary picks the smallest format the
        // requesting browser supports (WebP/AVIF/JPEG) and a
        // near-lossless-but-smaller quality automatically.
        const optimizedUrl = result.secure_url.replace(
          "/upload/",
          "/upload/f_auto,q_auto/",
        );
        resolve({ url: optimizedUrl, publicId: result.public_id });
      },
    );
    stream.end(processed);
  });
}

// Best-effort cleanup for a book's cover — handles both a Cloudinary asset
// (current) and a legacy local file (pre-migration), without throwing if
// either is already gone.
function deleteCoverAssets(book) {
  if (book.coverPublicId) {
    cloudinary.uploader.destroy(book.coverPublicId).catch(() => {});
  } else if (book.coverImage && book.coverImage.startsWith("/uploads/")) {
    fs.unlink(path.join(uploadsDir, path.basename(book.coverImage)), () => {});
  }
}

module.exports = { upload, saveCoverImage, deleteCoverAssets, uploadsDir };
