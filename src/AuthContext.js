import { createContext, useContext } from "react";

export const AuthContext = createContext(null);

// Throws instead of silently returning null/undefined, so a missing
// <AuthContext.Provider> fails loudly during development instead of
// causing confusing "auth is undefined" bugs deep in a child component.
export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within <AuthContext.Provider>");
  }
  return ctx;
}
