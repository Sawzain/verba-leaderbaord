// Runs on Vercel so the Discord token exchange leaves from Vercel's IP,
// not Render's (Render's shared IP is currently banned by Discord).
export default async function handler(req, res) {
  const code = req.query?.code;
  if (!code) {
    res.writeHead(302, { Location: "/?authError=discord" });
    return res.end();
  }

  try {
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI,
      }),
    });
    const tokenBody = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error("Discord token exchange failed", tokenRes.status, JSON.stringify(tokenBody));
      const err = tokenRes.status === 429 ? "discord_rate_limited" : "discord";
      res.writeHead(302, { Location: `/?authError=${err}` });
      return res.end();
    }

    const profileRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenBody.access_token}` },
    });
    if (!profileRes.ok) throw new Error(`Profile fetch failed: ${profileRes.status}`);
    const profile = await profileRes.json();

    const backendRes = await fetch(
      `${process.env.BACKEND_URL}/api/auth/discord/complete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-bridge-secret": process.env.DISCORD_BRIDGE_SECRET,
        },
        body: JSON.stringify({ profile }),
      },
    );
    const backendBody = await backendRes.json().catch(() => ({}));
    if (!backendRes.ok || !backendBody.code) {
      throw new Error(`Backend complete failed: ${backendRes.status}`);
    }

    res.writeHead(302, { Location: `/?discordExchange=${backendBody.code}` });
    return res.end();
  } catch (err) {
    console.error("discord-callback failed:", err);
    res.writeHead(302, { Location: "/?authError=discord" });
    return res.end();
  }
}
