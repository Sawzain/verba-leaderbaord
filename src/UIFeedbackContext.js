import { createContext, useContext } from "react";

export const UIFeedbackContext = createContext(null);

export function useUIFeedbackContext() {
  const ctx = useContext(UIFeedbackContext);
  if (!ctx) {
    throw new Error(
      "useUIFeedbackContext must be used within <UIFeedbackContext.Provider>",
    );
  }
  return ctx;
}

// Narrow accessors so consumers only import the piece they need.
export function useConfirm() {
  return useUIFeedbackContext().confirm;
}

export function useToast() {
  return useUIFeedbackContext().showToast;
}
