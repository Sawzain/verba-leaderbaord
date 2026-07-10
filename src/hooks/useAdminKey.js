import { useState } from "react";

export default function useAdminKey() {
  const [adminKey, setAdminKey] = useState(
    localStorage.getItem("verba-admin-key") || "",
  );

  const saveAdminKey = (key) => {
    setAdminKey(key);
    localStorage.setItem("verba-admin-key", key);
  };

  return { adminKey, saveAdminKey };
}
