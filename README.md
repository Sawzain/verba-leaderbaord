# Verba Leaderboard

A reading leaderboard for the Verba Book Club — a React (Vite) frontend
with a small Express + MongoDB backend.

## Setup

```bash
npm install
cp .env.example .env
# edit .env: set MONGO_URI to your MongoDB connection string,
# and API_KEY to a random secret (e.g. `openssl rand -hex 24`)
```

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

## Building for production

```bash
npm run build     # outputs static frontend to dist/
npm run server    # runs the API (make sure MONGO_URI / API_KEY are set)
```

If the frontend and API are deployed on different origins, set
`VITE_API_BASE` (e.g. `https://api.yourdomain.com/api`) before building
the frontend.
