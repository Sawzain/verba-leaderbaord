import { useState } from "react";
import { API_ROOT } from "./useMembers";

const TOKEN_KEY = "verba-member-token";
const USER_KEY = "verba-member-user";

// Real member accounts (name + email + password), separate from the admin
// x-api-key. This is what lets a review be tied to one specific person
// instead of just whatever name someone types in.
export default function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
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
  };
}
