import { useEffect, useState, useCallback } from "react";
import { API_ROOT } from "./useMembers";
import apiFetch from "../utils/apiFetch";

// Real member accounts (name + email + password, or Discord). Admin
// access is just an isAdmin flag on one of these accounts. The session
// itself lives in an httpOnly cookie the server sets — this hook never
// sees the token value directly, only whether /me resolves to a user.
export default function useAuth() {
  const [user, setUser] = useState(null);
  // Distinguishes "haven't checked the session yet" from "checked, and
  // you're not logged in" — since isLoggedIn can no longer be known
  // synchronously (no token to read from localStorage anymore), a
  // consumer that gates UI on isLoggedIn should wait for authReady
  // before treating a false as a real logged-out state, or it'll flash
  // a logged-out UI for a moment on every page load.
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authBusy, setAuthBusy] = useState(false);

  const applyUser = (me) =>
    setUser({
      id: me.id,
      name: me.name,
      email: me.email || "",
      isAdmin: Boolean(me.isAdmin),
      emailVerified: Boolean(me.emailVerified),
      avatarUrl: me.avatarUrl || "",
      requireEmailVerification: Boolean(me.requireEmailVerification),
    });

  const checkSession = useCallback(() => {
    return apiFetch(`${API_ROOT}/auth/me`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(applyUser)
      .catch(() => setUser(null))
      .finally(() => setAuthReady(true));
  }, []);

  // Discord's redirect back here carries a short-lived, single-use
  // exchange code rather than the session itself — see the comment on
  // pendingDiscordExchanges in server/routes/auth.js for why: a cookie
  // set directly on that redirect isn't reliably readable by this
  // frontend's later cross-site requests in browsers with strict
  // storage partitioning (Firefox's Total Cookie Protection, notably).
  // Redeeming the code via our own fetch (this effect) sets the cookie
  // in a partition our later requests can actually read.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const discordError = params.get("authError");
    const discordExchange = params.get("discordExchange");

    const stripParams = (keys) => {
      keys.forEach((k) => params.delete(k));
      const cleanUrl =
        window.location.pathname +
        (params.toString() ? `?${params}` : "") +
        window.location.hash;
      window.history.replaceState({}, "", cleanUrl);
    };

    if (discordError) {
      setAuthError("Discord login didn't work. Please try again.");
      stripParams(["authError"]);
      return;
    }

    if (!discordExchange) return;

    apiFetch(`${API_ROOT}/auth/discord/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: discordExchange }),
    })
      .then((res) => (res.ok ? checkSession() : Promise.reject()))
      .catch(() =>
        setAuthError("Discord login didn't work. Please try again."),
      )
      .finally(() => stripParams(["discordExchange"]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On every app load, ask the server whether the session cookie (if any)
  // is still valid — this replaces the old "read token from localStorage,
  // assume it's good" check. A valid session gets its cookie rolled
  // forward another 7 days (see /me on the server); an invalid or
  // missing one just resolves to logged-out. Skipped when a Discord
  // exchange is in flight (the effect above calls checkSession itself
  // once the exchange completes) — running both would briefly flash a
  // logged-out state before the exchange resolves.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("discordExchange")) {
      return;
    }
    checkSession();
  }, [checkSession]);

  const submit = async (path, payload) => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      const res = await apiFetch(`${API_ROOT}/auth/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Something went wrong");
      applyUser(body.user);
      return true;
    } catch (err) {
      setAuthError(err.message);
      return false;
    } finally {
      setAuthBusy(false);
    }
  };

  const register = (name, email, password) =>
    submit("register", { name, email, password });

  const login = (email, password) => submit("login", { email, password });

  const logout = async () => {
    try {
      // A cookie can only be cleared by the server — there's no local
      // equivalent of the old localStorage.removeItem anymore.
      await apiFetch(`${API_ROOT}/auth/logout`, { method: "POST" });
    } catch {
      // Non-fatal — clear local state regardless of whether the request
      // reached the server.
    }
    setUser(null);
  };

  // Resend the verification email to the logged-in user's own address.
  const resendVerification = async () => {
    const res = await apiFetch(`${API_ROOT}/auth/resend-verification`, {
      method: "POST",
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "Couldn't resend that email");
    return body;
  };

  // Request a password reset link. The server always returns the same
  // generic message regardless of whether the email has an account —
  // that's intentional, so this always just resolves with that message
  // rather than throwing on a "not found" case. Unauthenticated, so no
  // session cookie/CSRF header is relevant — plain fetch is fine.
  const forgotPassword = async (email) => {
    try {
      const res = await fetch(`${API_ROOT}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = await res.json().catch(() => ({}));
      return (
        body.message ||
        "If an account exists for that email, we've sent a link to reset the password."
      );
    } catch (err) {
      throw new Error(
        "Couldn't reach the server. Check your connection and try again.",
      );
    }
  };

  // Complete a password reset using the token from the emailed link.
  // Also unauthenticated — this token is a separate, single-use reset
  // token, not the session cookie.
  const resetPassword = async (resetToken, password) => {
    const res = await fetch(`${API_ROOT}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: resetToken, password }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "Couldn't reset your password");
    return body;
  };

  // API_ROOT is "/api" in dev (proxied) or an absolute backend URL in prod.
  // Discord needs a real, absolute redirect target, so resolve "/api" against
  // the current page origin.
  const discordLoginUrl = new URL(
    `${API_ROOT}/auth/discord`,
    window.location.href,
  ).toString();

  return {
    user,
    isLoggedIn: !!user,
    authReady,
    authError,
    setAuthError,
    authBusy,
    register,
    login,
    logout,
    resendVerification,
    forgotPassword,
    resetPassword,
    discordLoginUrl,
  };
}
