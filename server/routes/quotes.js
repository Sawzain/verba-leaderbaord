const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const requireApiKey = require("../middleware/apiKey");
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

let _supabase = null;
function getSupabase() {
  if (!SUPABASE_CONFIGURED) return null;
  if (!_supabase) {
    _supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  }
  return _supabase;
}

// Mounted at /api/quotes in app.js, so this is the root: GET /api/quotes
// e.g. /api/quotes?book=<title>&source=poetry-corner&featured=true&favoriteOnly=true&limit=30&offset=0
router.get("/", async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    return res
      .status(503)
      .json({ error: "Quotes are not configured on this server yet." });
  }

  const {
    book,
    source,
    featured,
    favoriteOnly,
    q,
    sort = "latest", // "latest" | "interactions"
    limit = 30,
    offset = 0,
  } = req.query;

  let query = supabase.from("quotes").select("*", { count: "exact" });

  if (book) query = query.eq("book_title", book);
  if (source) query = query.eq("source_channel", source); // 'quotes-highlights' | 'poetry-corner'
  if (featured === "true") query = query.eq("is_featured", true);
  // Admin-curated "favorites" — separate flag from is_featured, toggled below.
  if (favoriteOnly === "true") query = query.eq("is_admin_favorite", true);
  // Free-text search — matches quote/poem body, author name, or book title.
  // Escape % and , since they're meaningful to Supabase's .or() filter syntax.
  if (q) {
    const safe = q.replace(/[%,]/g, "\\$&");
    query = query.or(
      `quote_text.ilike.%${safe}%,display_name.ilike.%${safe}%,book_title.ilike.%${safe}%`,
    );
  }
  query = query.eq("is_approved", true); // never show unapproved content publicly

  // "interactions" needs reaction_count, which Twig doesn't populate yet —
  // safe to enable now, it just ties back to created_at until real data exists.
  if (sort === "interactions") {
    query = query
      .order("reaction_count", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }
  query = query.range(Number(offset), Number(offset) + Number(limit) - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("[quotes route] error:", error.message);
    return res.status(500).json({ error: "Failed to fetch quotes" });
  }

  res.json({ quotes: data, total: count });
});

// PATCH: admin-only toggle for the "favorite" flag (curated highlights,
// not to be confused with is_featured which drives the sidebar's old
// single-quote spotlight).
router.patch("/:id/favorite", requireApiKey, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    return res
      .status(503)
      .json({ error: "Quotes are not configured on this server yet." });
  }

  const { data, error } = await supabase
    .from("quotes")
    .update({ is_admin_favorite: Boolean(req.body.favorite) })
    .eq("id", req.params.id)
    .select()
    .single();

  if (error) {
    console.error("[quotes route] favorite toggle error:", error.message);
    return res.status(500).json({ error: "Couldn't update favorite" });
  }

  res.json(data);
});
// DELETE: admin-only removal of a quote/poem — off-topic, spam, posted by
// mistake, etc. Supabase is the source of truth here (Twig writes directly
// to it), so this is a real delete, matching how reviews are hard-deleted
// elsewhere in the app rather than soft-flipping is_approved.
router.delete("/:id", requireApiKey, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    return res
      .status(503)
      .json({ error: "Quotes are not configured on this server yet." });
  }

  const { error } = await supabase
    .from("quotes")
    .delete()
    .eq("id", req.params.id);

  if (error) {
    console.error("[quotes route] delete error:", error.message);
    return res.status(500).json({ error: "Couldn't delete that quote" });
  }

  res.sendStatus(204);
});

module.exports = router;
