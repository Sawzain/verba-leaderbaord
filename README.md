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
- A **Recent Activity** card in the sidebar (see "Layout" below) covering
  finishes, reviews, and quotes/poems together — not just book finishes.

**Member profiles** — hovering (desktop) or tapping (mobile) a leaderboard
row shows a quick preview card; clicking through opens that member's full
page at `/app/members/:id`. Every member's page shows their avatar, points,
and a **Books Read** list (titles, collapsing to the first 3 with a "Show
more" toggle once there are more). Members who've linked a Discord account
also get a bio, favorite genre tags, and their reviews — each review links
to that book's page. Members who haven't linked Discord see a stats-only
view with a prompt to connect.

**Book reviews** — members log in with Discord (email/password accounts
exist behind a feature flag that is off by default — see "Email login"
below), then rate and review books on the shelf. One review per
member per book. Admins can add books with a cover image, remove books,
and mark one book as the "current pick" shown on the public landing page.
Each book has its own page at `/app/reviews/:bookId`, linked from the
leaderboard preview card, member profile reviews, and the landing page's
current-pick teaser. On a book's page, each review's author name links
back to that member's profile (`/app/members/:id`) when they're linked to
a Discord account; unlinked reviewers show as plain text since there's no
profile page to send them to.

**Verba Wall** — a scrollable, paginated wall of quotes and poems pulled
from the club's `#quotes-highlights` and `#poetry-corner` Discord channels.
Content is captured automatically by the Twig Discord bot (a separate
project) and written to a shared Supabase table; this app only reads from
it via `GET /api/quotes`. A toggle switches between Quotes, Poems, and All,
and posts can optionally be filtered by book. When a quote's `book_title`
(set by Twig) matches a title in the currently-loaded books list, it
links to that book's page — matching is exact and case-insensitive, so a
mistyped or older title just falls back to plain text rather than
guessing. See `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` below for the
required env vars — without them, the Verba Wall tab still renders but
shows a "not configured" error instead of content.

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

## Security & backend middleware

- **Helmet** — `app.use(helmet())` sets Express's response security headers
  (CSP, HSTS, etc.) using Helmet's defaults; no custom configuration.
- **CORS** — locked to `FRONTEND_ORIGIN` when it's set; wide open otherwise,
  which is fine for local dev but `FRONTEND_ORIGIN` should always be set
  in production.
- **Passwords** — hashed with bcrypt (`bcryptjs`) before being stored;
  plaintext passwords are never persisted.
- **Login tokens (JWT)** — signed with `JWT_SECRET` on login and expire
  after 7 days. The token lives in an httpOnly session cookie that is
  re-issued on every `/api/auth/me` call, so active members stay logged
  in. In production the cookies are `SameSite=None; Secure; Partitioned`,
  because the frontend (Vercel) and the API (Render) are on different
  sites. `requireAuth` (any logged-in member) and
  `requireAdminAccount` (must have `isAdmin: true`) are separate middleware
  in `middleware/auth.js`, composed per-route depending on what a route
  needs.
- **Rate limiting** — login and register are limited to 10 attempts per
  15 minutes per IP (`middleware/rateLimiters.js`), to slow down
  brute-force attempts without needing a captcha. `app.set("trust proxy", 1)`
  is set so this keys off the real client IP on Render, not the proxy's.
- **CSRF protection** — double-submit token (`middleware/csrf.js`). On
  login the server sets a non-httpOnly `verba_csrf` cookie and also
  returns the same token in the JSON of `/api/auth/me`, `/login` and
  `/register`. Because the frontend and API are on different sites, the
  frontend can't read the API's cookie, so it keeps the token from the
  JSON in memory (`src/utils/apiFetch.js`) and sends it as `X-CSRF-Token`
  on every non-GET request. Requests with a session cookie but no
  matching header get a 403. The Discord exchange and complete routes are
  exempt (they're protected by a single-use code and a shared secret).
- **Compression** — responses are compressed (gzip or Brotli, depending on
  what the browser supports) via the `compression` middleware, which keeps
  JSON payloads small.

## Layout

Reviews, Leaderboard, and Verba Wall share one wide two-column layout
(`TwoColumnLayout` — see `WIDE_LAYOUT_ROUTES` in `AppShell.jsx`): a main
content column plus a sidebar of small "preview" cards that link out to
the other tabs. This replaced an earlier version where each of those three
pages had its own one-off layout and didn't visually read as the same
site. Every route not listed in `WIDE_LAYOUT_ROUTES` still gets the
original narrower single-column shell (Manage, member profiles, etc.) —
add a route there if a future page needs the wide treatment.

The sidebar is assembled per-page from four reusable preview components in
`src/components/`, each pulling from data already fetched in `AppShell`
(no extra requests):

- `RecentActivityPreview` — merges two independently-sourced feeds: book
  finishes/reviews from Mongo's `ActivityLog` (`GET /api/activity`), and
  quotes/poems from Supabase (`useQuotes`, unfiltered). Quotes never pass
  through the Express API — Twig writes them straight to Supabase — so
  there's no shared `ActivityLog` row to join against; this component
  merges the two lists client-side by timestamp instead of requiring a
  backend sync job.
- `CurrentPickPreview` — this month's book, with cover and rating.
- `VerbaWallPreview` — the featured (or most recent) quote.
- `ReaderIndexPreview` — top 3 of the leaderboard.

Each page shows `RecentActivityPreview` plus whichever two of the
remaining three aren't already its main content — e.g. Leaderboard's
sidebar doesn't also show a leaderboard preview.

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

When email login is enabled, new accounts get a verification email via
Resend. Leaving `RESEND_API_KEY`
unset just logs the verification link to the server console instead of
emailing it — fine for local dev. Enforcement is off by default
(`REQUIRE_EMAIL_VERIFICATION=false`); members can review without verifying
until you turn it on.

## Discord login

Discord is the primary way to log in. In production the OAuth flow runs
through two Vercel serverless functions instead of the Express API,
because Discord rate-limited (IP-banned) the token exchange when it came
from Render's shared outbound IP.

How it works:

1. **"Continue with Discord"** goes to `api/discord-login.mjs` on Vercel.
   It creates a random `state` value, stores it in a short-lived
   `verba_oauth_state` cookie on the Vercel domain, and redirects to
   Discord.
2. **Discord** sends the member back to `api/discord-callback.mjs` with a
   `code` and the same `state`. The function rejects the request unless
   the state matches the cookie (login CSRF protection), then exchanges
   the code for a token and fetches the Discord profile.
3. The function POSTs the profile to Render at
   `/api/auth/discord/complete`, authenticated with the
   `x-bridge-secret` header. Render creates or links the user (an
   existing account is linked by email only when Discord reports that
   email as verified), links their Score, and returns a single-use
   exchange code.
4. The member is redirected to `/?discordExchange=<code>`. The frontend
   POSTs the code to `/api/auth/discord/exchange`, which sets the session
   cookies from a fetch made by the frontend (the right cookie partition
   for browsers with strict storage partitioning), then calls `/me`.

Setup:

1. Create an app at the [Discord Developer Portal](https://discord.com/developers/applications).
2. Under OAuth2 -> Redirects, add
   `https://verba-leaderboard.vercel.app/api/discord-callback`. This must
   be exactly the value of `DISCORD_REDIRECT_URI` on both Vercel and
   Render.
3. Set these environment variables:
   - **Vercel:** `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`,
     `DISCORD_REDIRECT_URI`, `DISCORD_BRIDGE_SECRET`, `BACKEND_URL`.
   - **Render:** `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`,
     `DISCORD_REDIRECT_URI`, `DISCORD_BRIDGE_SECRET` (must equal
     Vercel's), `FRONTEND_ORIGIN` (the Vercel URL, no trailing slash),
     `NODE_ENV=production`.

Notes:

- Vercel env var changes only apply to new deployments, so redeploy after
  changing them.
- Pending exchange codes live in an in-memory `Map` on the API, so this
  only works with a single Render instance. Move them to Mongo or Redis
  before scaling out.
- Locally, Vite doesn't run Vercel functions. In dev the login button
  uses the Express routes (`/api/auth/discord` and
  `/api/auth/discord/callback`, with `DISCORD_REDIRECT_URI` set to
  `http://localhost:5000/api/auth/discord/callback`), which don't check
  `state`.
- A failed login redirects to `/?authError=discord`, or
  `/?authError=discord_rate_limited` if Discord returns a 429.

## Email login (off by default)

Email/password accounts are switched off. The server returns 403 on
`/api/auth/register`, `/login`, `/forgot-password` and `/reset-password`,
and the login panel shows only the Discord button. Existing email
accounts can't log in while it's off, but Discord login links to an
existing account when the verified Discord email matches.

To turn it back on, set both flags:

- `EMAIL_AUTH_ENABLED=true` on the server (Render, or `.env` locally).
- `VITE_EMAIL_AUTH_ENABLED=true` for the frontend (Vercel, or `.env`
  locally). This is read at build time, so redeploy Vercel after
  changing it.

## Project structure

```
api/              Vercel serverless functions (discord-login, discord-callback)
src/              React frontend (Vite)
  hooks/          data-fetching hooks (useAuth, useMembers, useBooks, useQuotes)
  components/     presentational components, incl. TwoColumnLayout (shared
                  wide-page shell) and its four sidebar cards —
                  RecentActivityPreview, CurrentPickPreview, VerbaWallPreview,
                  ReaderIndexPreview — see "Layout" above
  pages/          route-level components (..., QuotesPage — "Verba Wall" tab)

server/
  app.js          Express app: middleware + route mounting (no listen())
  server.js       startup: env checks, DB connect, listen()
  routes/         one file per resource (members, auth, admin, books, reviews, quotes)
  middleware/     auth, admin-key, rate limiting
  config/         env constants (incl. Supabase), Cloudinary, Resend
  utils/          tokens, review-points logic
  models/         Mongoose schemas (Verba Wall content lives in Supabase, not here)
  tests/          Jest + Supertest, run against an in-memory MongoDB
```

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

The test setup file (`server/test-utils/setupEnv.js`) turns
`EMAIL_AUTH_ENABLED` on so the email login tests can run, and
`emailAuthDisabled.test.js` checks that those routes return 403 when the
flag is off.

## Building for production

```bash
npm run build     # outputs static frontend to dist/
npm run server    # runs the API (make sure MONGO_URI / API_KEY / etc. are set)
```

If the frontend and API are deployed on different origins, set
`VITE_API_BASE` (e.g. `https://api.yourdomain.com/api`) before building
the frontend.
