import { useCallback, useEffect, useState } from "react";
import { API_ROOT } from "./useMembers";
import apiFetch from "../utils/apiFetch";

const REVIEWS_PAGE_SIZE = 10;

// Fetches and manages a single member's profile page: their stats always,
// plus bio/genres/reviews once linked. Also exposes updateProfile for the
// owner's own edit form — the server re-checks ownership on PUT regardless,
// this hook just wires the request up.
//
// `token` is no longer used internally — auth now travels via an httpOnly
// session cookie through apiFetch — kept as a parameter so existing
// callers don't need to change their call site.
export default function useMemberProfile(id, token) {
  const [profile, setProfile] = useState(null);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(1);

  const load = useCallback(
    (targetReviewsPage = 1) => {
      setLoading(true);
      setError(null);
      Promise.all([
        fetch(
          `${API_ROOT}/members/${id}/profile?reviewsPage=${targetReviewsPage}&reviewsLimit=${REVIEWS_PAGE_SIZE}`,
        ).then((res) => (res.ok ? res.json() : Promise.reject(res))),
        fetch(`${API_ROOT}/members/genres`).then((res) =>
          res.ok ? res.json() : [],
        ),
      ])
        .then(([profileData, genreList]) => {
          setProfile(profileData);
          setGenres(genreList);
          setReviewsPage(profileData.reviewsPage || 1);
          setReviewsTotalPages(profileData.reviewsTotalPages || 1);
        })
        .catch(() => setError("Couldn't load this profile."))
        .finally(() => setLoading(false));
    },
    [id],
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const goToReviewsPage = (page) => load(page);

  const updateProfile = async (updates) => {
    setSaving(true);
    try {
      const res = await apiFetch(`${API_ROOT}/members/${id}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
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

  return {
    profile,
    genres,
    loading,
    error,
    saving,
    updateProfile,
    reload: load,
    reviewsPage,
    reviewsTotalPages,
    goToReviewsPage,
  };
}
