import crypto from "node:crypto";

export default function handler(req, res) {
  const { DISCORD_CLIENT_ID, DISCORD_REDIRECT_URI } = process.env;
  if (!DISCORD_CLIENT_ID || !DISCORD_REDIRECT_URI) {
    res.statusCode = 503;
    res.end("Discord login isn't configured on this deployment yet.");
    return;
  }

  // Random value tied to this browser: stored in a short-lived cookie here
  // and echoed back by Discord, so the callback can prove the login was
  // started by the same browser that is finishing it.
  const state = crypto.randomBytes(24).toString("hex");

  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: DISCORD_REDIRECT_URI,
    response_type: "code",
    scope: "identify email",
    prompt: "consent",
    state,
  });

  res.setHeader(
    "Set-Cookie",
    `verba_oauth_state=${state}; Max-Age=600; Path=/api; HttpOnly; Secure; SameSite=Lax`,
  );
  res.statusCode = 302;
  res.setHeader(
    "Location",
    `https://discord.com/api/oauth2/authorize?${params.toString()}`,
  );
  res.end();
}