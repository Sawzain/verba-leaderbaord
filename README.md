# Verba Leaderboard

A reading leaderboard for the Verba Book Club — a React (Vite) frontend
with a small Express + MongoDB backend.

## Setup

```bash
npm install
cp .env.example .env
# edit .env: set MONGO_URI to your MongoDB connection string,
# API_KEY to a random secret (e.g. `openssl rand -hex 24`),
# JWT_SECRET to another random secret (e.g. `openssl rand -hex 32`),
# and CLOUDINARY_URL to your Cloudinary connection string (see below).
```

## Book covers (Cloudinary)

Book covers are stored on Cloudinary, not on disk — Render's free tier disk
is ephemeral, so anything written to it disappears on the next deploy or
restart. Create a free account at [cloudinary.com](https://cloudinary.com),
then copy the "API Environment variable" from your dashboard (it looks like
`cloudinary://<api_key>:<api_secret>@<cloud_name>`) into `CLOUDINARY_URL`.
The server refuses to start without it, the same way it does for `MONGO_URI`.

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

## Running locally

You need both the backend and frontend running:

```bash
npm run server:dev   # Express API on http://localhost:5000 (auto-restarts)
npm run dev           # Vite dev server, proxies /api to the backend
```

Open the URL Vite prints (usually http://localhost:5173).

## Managing members

Go to the **Manage** tab and enter the admin key (the `API_KEY` value from
your `.env`) to unlock editing. Once unlocked you can add members, adjust
points with +/-, edit a score directly, or remove a member. The tab shows
whether you're locked or unlocked at all times, and tells you clearly if
a key is rejected.

Members also earn leaderboard points automatically by submitting a review
(`REVIEW_POINTS` in `.env`, default 10) — matched to a Score entry by
username. Deleting a review refunds those points.

## Building for production

```bash
npm run build     # outputs static frontend to dist/
npm run server    # runs the API (make sure MONGO_URI / API_KEY are set)
```

If the frontend and API are deployed on different origins, set
`VITE_API_BASE` (e.g. `https://api.yourdomain.com/api`) before building
the frontend.
