// Express route: GET /api/quotes
// Matches the pattern of server/routes/books.js etc. Your main data lives in
// MongoDB, but quotes live in Supabase (captured by Twig) — so this route
// talks to Supabase directly rather than going through a Mongoose model.
// Mount in app.js the same way as the other routers:
//
//   const quotesRouter = require("./routes/quotes");
//   app.use("/api/quotes", quotesRouter);
//
// npm install @supabase/supabase-js  (add to server/package.json)

const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_CONFIGURED,
} = require("../config/env");

const router = express.Router();

if (!SUPABASE_CONFIGURED) {
  console.warn(
    "[quotes route] Supabase env vars missing — /api/quotes will error until set.",
  );
}

// Lazy singleton: only construct the client the first time a request
// actually needs it, so simply requiring this file (e.g. in tests, or
// anywhere SUPABASE_* isn't set) never crashes the process.
let _supabase = null;
function getSupabase() {
  if (!SUPABASE_CONFIGURED) return null;
  if (!_supabase) {
    _supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  }
  return _supabase;
}

// Mounted at /api/quotes in app.js, so this is the root: GET /api/quotes
// e.g. /api/quotes?book=<title>&source=poetry-corner&featured=true&limit=30&offset=0
router.get("/", async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    return res
      .status(503)
      .json({ error: "Quotes are not configured on this server yet." });
  }

  const { book, source, featured, limit = 30, offset = 0 } = req.query;

  let query = supabase
    .from("quotes")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (book) query = query.eq("book_title", book);
  if (source) query = query.eq("source_channel", source); // 'quotes-highlights' | 'poetry-corner'
  if (featured === "true") query = query.eq("is_featured", true);
  query = query.eq("is_approved", true); // never show unapproved content publicly

  const { data, error, count } = await query;

  if (error) {
    console.error("[quotes route] error:", error.message);
    return res.status(500).json({ error: "Failed to fetch quotes" });
  }

  res.json({ quotes: data, total: count });
});

module.exports = router;
