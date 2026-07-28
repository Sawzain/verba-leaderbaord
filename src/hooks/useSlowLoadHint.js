import { useEffect, useState } from "react";

// Returns true only if `active` stays true past `delayMs`. Used so a normal,
// fast page load never flashes a message, but a real Render free-tier
// cold-start (server asleep, taking 20-60s to wake up) gets an explanation
// instead of looking broken or frozen.
export default function useSlowLoadHint(active, delayMs = 4000) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!active) {
      setShow(false);
      return;
    }
    const timer = setTimeout(() => setShow(true), delayMs);
    return () => clearTimeout(timer);
  }, [active, delayMs]);

  return show;
}
