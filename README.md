# Verba Leaderboard

A reading leaderboard and book-review site for the Verba Book Club — a React
(Vite) frontend with an Express + MongoDB backend.

## Setup

```bash
npm install
cp .env.example .env
# edit .env — see the comments in that file for what each variable does
# and where to get it. MONGO_URI, API_KEY, JWT_SECRET, and CLOUDINARY_URL
# are required; the server refuses to start without them.
```

## Running locally

You need both the backend and frontend running:

```bash
npm run server:dev   # Express API on http://localhost:5000 (auto-restarts)
npm run dev           # Vite dev server, proxies /api and /uploads to the backend
```

Open the URL Vite prints (usually http://localhost:5173).

## Features

**Leaderboard** — members earn points for reading; admins add/adjust scores
by hand in the Manage tab, or (optionally) automatically when a member
submits a review — see `AUTO_AWARD_REVIEW_POINTS` below.

The public leaderboard page also shows:

- A **pulse strip** at the top with reader count, distinct books read, and
  total "verses on the Wall" (quotes + poems from the Verba Wall/Twig bot).
- A small italic line under each member's name showing the book they most
  recently finished.
- A **Recent Activity** panel below the ranked list, listing the most
  recent "finished [book]" entries across all members.

**Member profiles** — hovering (desktop) or tapping (mobile) a leaderboard
row shows a quick preview card; clicking through opens that member's full
page at `/app/members/:id`. Every member's page shows their avatar, points,
and a **Books Read** list (titles, collapsing to the first 3 with a "Show
more" toggle once there are more). Members who've linked a Discord account
also get a bio, favorite genre tags, and their reviews — each review links
to that book's page. Members who haven't linked Discord see a stats-only
view with a prompt to connect.

**Book reviews** — members create an account (email/password or "Continue
with Discord"), then rate and review books on the shelf. One review per
member per book. Admins can add books with a cover image, remove books,
and mark one book as the "current pick" shown on the public landing page.
Each book has its own page at `/app/reviews/:bookId`, linked from the
leaderboard preview card, member profile reviews, and the landing page's
current-pick teaser.

**Verba Wall** — a scrollable, paginated wall of quotes and poems pulled
from the club's `#quotes-highlights` and `#poetry-corner` Discord channels.
Content is captured automatically by the Twig Discord bot (a separate
project) and written to a shared Supabase table; this app only reads from
it via `GET /api/quotes`. A toggle switches between Quotes, Poems, and All,
and posts can optionally be filtered by book. See `SUPABASE_URL` /
`SUPABASE_SERVICE_ROLE_KEY` below for the required env vars — without
them, the Verba Wall tab still renders but shows a "not configured" error
instead of content.

**Accounts & admin access** — there's no separate admin key to type in
anymore. Admin access is an `isAdmin` flag on a normal member account. Log
in from the header (visible on every tab) like any other member; if your
account has the flag, you can add/edit/remove members and books. The
Manage tab itself only appears in the tab bar once you're logged in with
an admin account — non-admins won't see it listed at all. To grant admin
access, set `isAdmin: true` directly on a user's document in MongoDB
(there's no UI for this yet).

The legacy shared `API_KEY` still works as a fallback for the same
admin-only routes (useful for scripts or before you've granted anyone the
`isAdmin` flag), sent as an `x-api-key` header.

## Book covers (Cloudinary)

Book covers are stored on Cloudinary, not on disk — Render's free tier disk
is ephemeral, so anything written to it disappears on the next deploy or
restart. Create a free account at [cloudinary.com](https://cloudinary.com),
then copy the "API Environment variable" from your dashboard (it looks like
`cloudinary://<api_key>:<api_secret>@<cloud_name>`) into `CLOUDINARY_URL`.
The server refuses to start without it, the same way it does for `MONGO_URI`.

## Verba Wall (Supabase)

Quotes and poems live in a separate Supabase project (the same one used by
the Twig Discord bot) rather than MongoDB, since Twig already writes there.
This app only needs read access:

1. In the Supabase dashboard for that project, go to **Settings → API**.
2. Copy the **Project URL** into `SUPABASE_URL`.
3. Copy the **`service_role`** key (not `anon`) into
   `SUPABASE_SERVICE_ROLE_KEY`.

Unlike `MONGO_URI` and `CLOUDINARY_URL`, the server does **not** refuse to
start if these are missing — `GET /api/quotes` just returns a 503 with a
"not configured" message until they're set, so local development without
Supabase access still works for everything else.

The `quotes` table itself, and the Twig-side capture logic, live in the
verba-bot repo, not here.

## Email verification (optional)

New accounts get a verification email via Resend. Leaving `RESEND_API_KEY`
unset just logs the verification link to the server console instead of
emailing it — fine for local dev. Enforcement is off by default
(`REQUIRE_EMAIL_VERIFICATION=false`); members can review without verifying
until you turn it on.

## Discord login (optional)

Members can log in with Discord instead of an email/password account. To
enable it:

1. Create an app at the [Discord Developer Portal](https://discord.com/developers/applications).
2. Under OAuth2, add a redirect URL matching `DISCORD_REDIRECT_URI` in your
   `.env` (e.g. `http://localhost:5000/api/auth/discord/callback` locally,
   or `https://your-api.onrender.com/api/auth/discord/callback` in prod).
3. Copy the Client ID and Client Secret into `DISCORD_CLIENT_ID` and
   `DISCORD_CLIENT_SECRET`.

Leaving these unset just disables the "Continue with Discord" button —
email/password login keeps working either way.

## Project structure

src/ React frontend (Vite)
hooks/ data-fetching hooks (useAuth, useMembers, useBooks, useQuotes)
components/ presentational components (..., QuoteWallView)
pages/ route-level components (..., QuotesPage — "Verba Wall" tab)

server/
app.js Express app: middleware + route mounting (no listen())
server.js startup: env checks, DB connect, listen()
routes/ one file per resource (members, auth, admin, books, reviews, quotes)
middleware/ auth, admin-key, rate limiting
config/ env constants (incl. Supabase), Cloudinary, Resend
utils/ tokens, review-points logic
models/ Mongoose schemas (Verba Wall content lives in Supabase, not here)
tests/ Jest + Supertest, run against an in-memory MongoDB

## Tests

```bash
npm test
```

Runs against an in-memory MongoDB (`mongodb-memory-server`), so no real
database connection is needed. CI (`.github/workflows/ci.yml`) runs this
plus a frontend build on every push and PR. The `quotes` route's Supabase
client is constructed lazily (only on first request, not at import time),
so tests run fine even without `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`
set.

## Building for production

```bash
npm run build     # outputs static frontend to dist/
npm run server    # runs the API (make sure MONGO_URI / API_KEY / etc. are set)
```

If the frontend and API are deployed on different origins, set
`VITE_API_BASE` (e.g. `https://api.yourdomain.com/api`) before building
the frontend.
