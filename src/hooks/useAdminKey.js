import { useEffect, useState } from "react";
import { API_ROOT } from "./useMembers";

const STORAGE_KEY = "verba-admin-key";

// Tracks the admin key AND whether it's actually been verified against the
// server, so the UI can show a clear "locked / unlocked" state instead of
// only finding out a key is wrong after an add/edit/delete fails.
export default function useAdminKey() {
  const [adminKey, setAdminKey] = useState(
    () => localStorage.getItem(STORAGE_KEY) || "",
  );
  // "unknown" | "checking" | "valid" | "invalid"
  const [status, setStatus] = useState("unknown");

  const verify = async (key) => {
    if (!key) {
      setStatus("unknown");
      return false;
    }
    setStatus("checking");
    try {
      const res = await fetch(`${API_ROOT}/admin/verify`, {
        headers: { "x-api-key": key },
      });
      const ok = res.ok;
      setStatus(ok ? "valid" : "invalid");
      return ok;
    } catch (err) {
      setStatus("invalid");
      return false;
    }
  };

  // Re-check silently on first load if a key was already saved.
  useEffect(() => {
    if (adminKey) verify(adminKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unlock = async (key) => {
    const ok = await verify(key);
    if (ok) {
      setAdminKey(key);
      localStorage.setItem(STORAGE_KEY, key);
    }
    return ok;
  };

  const lock = () => {
    setAdminKey("");
    setStatus("unknown");
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    adminKey,
    status,
    isUnlocked: status === "valid",
    unlock,
    lock,
  };
}
