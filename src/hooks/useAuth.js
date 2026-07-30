import { useEffect, useState } from "react";
import { API_ROOT } from "./useMembers";

const TOKEN_KEY = "verba-member-token";
const USER_KEY = "verba-member-user";

// Real member accounts (name + email + password, or Discord). Admin access
// is just an isAdmin flag on one of these accounts now — there's no
// separate shared key.
export default function useAuth() {
  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_KEY) || "",
  );
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch {
      return null;
    }
  });
  const [authError, setAuthError] = useState(null);
  const [authBusy, setAuthBusy] = useState(false);

  const persist = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  };

  // After "Log in with Discord", the backend redirects back here with
  // ?token=... in the URL. Pick it up, fetch who it belongs to, persist it
  // like any other login, then strip it from the address bar.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const incomingToken = params.get("token");
    const discordError = params.get("authError");

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

    if (!incomingToken) return;

    fetch(`${API_ROOT}/auth/me`, {
      headers: { Authorization: `Bearer ${incomingToken}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((me) => {
        persist(incomingToken, {
          id: me.id,
          name: me.name,
          email: me.email || "",
          isAdmin: Boolean(me.isAdmin),
          emailVerified: Boolean(me.emailVerified),
          requireEmailVerification: Boolean(me.requireEmailVerification),
        });
        stripParams(["token"]);
      })
      .catch(() =>
        setAuthError("Discord login didn't work. Please try again."),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (path, payload) => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      const res = await fetch(`${API_ROOT}/auth/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Something went wrong");
      persist(body.token, body.user);
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

  const logout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  // Resend the verification email to the logged-in user's own address.
  const resendVerification = async () => {
    const res = await fetch(`${API_ROOT}/auth/resend-verification`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "Couldn't resend that email");
    return body;
  };

  // Request a password reset link. The server always returns the same
  // generic message regardless of whether the email has an account —
  // that's intentional, so this always just resolves with that message
  // rather than throwing on a "not found" case.
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
    token,
    user,
    isLoggedIn: !!token,
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
