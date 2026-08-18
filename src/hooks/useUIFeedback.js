import { useState, useCallback, useRef } from "react";

// Central state for the confirm-dialog and toast system — mounted once via
// UIFeedbackContext in App.jsx, consumed anywhere via useConfirm()/useToast().
export default function useUIFeedback() {
  const [confirmState, setConfirmState] = useState(null); // { message, resolve }
  const [toast, setToast] = useState(null); // { message, type }
  const toastTimer = useRef(null);

  // Returns a Promise<boolean> — replaces window.confirm's return value,
  // but async so callers do `if (await confirm(...))` instead of a
  // blocking dialog.
  const confirm = useCallback((message) => {
    return new Promise((resolve) => {
      setConfirmState({ message, resolve });
    });
  }, []);

  const resolveConfirm = useCallback((result) => {
    setConfirmState((current) => {
      current?.resolve(result);
      return null;
    });
  }, []);

  const showToast = useCallback((message, type = "error") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }, []);

  const dismissToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(null);
  }, []);

  return {
    confirmState,
    resolveConfirm,
    confirm,
    toast,
    showToast,
    dismissToast,
  };
}
