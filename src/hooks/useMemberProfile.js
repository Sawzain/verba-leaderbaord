import { useCallback, useEffect, useState } from "react";
import { API_ROOT } from "./useMembers";

// Fetches and manages a single member's profile page: their stats always,
// plus bio/genres/reviews once linked. Also exposes updateProfile for the
// owner's own edit form — the server re-checks ownership on PUT regardless,
// this hook just wires the request up.
export default function useMemberProfile(id, token) {
  const [profile, setProfile] = useState(null);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`${API_ROOT}/members/${id}/profile`).then((res) =>
        res.ok ? res.json() : Promise.reject(res),
      ),
      fetch(`${API_ROOT}/members/genres`).then((res) =>
        res.ok ? res.json() : [],
      ),
    ])
      .then(([profileData, genreList]) => {
        setProfile(profileData);
        setGenres(genreList);
      })
      .catch(() => setError("Couldn't load this profile."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const updateProfile = async (updates) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_ROOT}/members/${id}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Couldn't save your profile");
      setProfile((prev) => ({ ...prev, ...body }));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { profile, genres, loading, error, saving, updateProfile, reload: load };
}
