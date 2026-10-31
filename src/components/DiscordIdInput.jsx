import { useState, useEffect, useRef } from "react";
import apiFetch from "../utils/apiFetch";
import { API_ROOT } from "../hooks/useMembers";
import { SAGE, SAGE_DEEP, PAPER, INK, FONT_SERIF } from "../theme";

const ID_RE = /^\d{15,25}$/;

// Discord ID field with autofill. Type part of a name (or leave it empty
// while the Name field is filled) to see matching server members, then
// pick one. Pasting a raw ID also works. The parent only ever receives a
// valid ID or an empty string.
export default function DiscordIdInput({
  value,
  onChange,
  onEnter,
  nameHint = "",
  style,
}) {
  const [text, setText] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pickedLabel, setPickedLabel] = useState("");
  const lastEmitted = useRef(value);

  const emit = (v) => {
    lastEmitted.current = v;
    onChange(v);
  };

  // The parent cleared or replaced the value (e.g. after a successful add).
  useEffect(() => {
    if (value !== lastEmitted.current) {
      lastEmitted.current = value;
      setText(value);
      setPickedLabel("");
    }
  }, [value]);

  const query = value ? "" : text.trim() || (focused ? nameHint.trim() : "");

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await apiFetch(
          `${API_ROOT}/discord-members?q=${encodeURIComponent(query)}`,
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setSuggestions(Array.isArray(data) ? data : []);
      } catch {
        // Suggestions are a convenience; typing an ID by hand still works.
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const pick = (m) => {
    const label = m.displayName || m.username;
    setText(label);
    setPickedLabel(`${label} (@${m.username})`);
    emit(m.discordId);
    setSuggestions([]);
    setOpen(false);
  };

  const handleChange = (e) => {
    const t = e.target.value;
    setText(t);
    setPickedLabel("");
    setOpen(true);
    emit(ID_RE.test(t.trim()) ? t.trim() : "");
  };

  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;
    // With suggestions showing and nothing chosen yet, Enter picks the
    // first one instead of adding the member without an ID.
    if (!value && open && suggestions.length > 0) {
      e.preventDefault();
      pick(suggestions[0]);
      return;
    }
    onEnter?.();
  };

  return (
    <div style={{ position: "relative", flex: "1 1 150px", minWidth: 0 }}>
      <input
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          setFocused(true);
          setOpen(true);
        }}
        onBlur={() => {
          setFocused(false);
          setTimeout(() => setOpen(false), 150);
        }}
        placeholder="Discord name or ID (optional)"
        title="Search the Discord server by name, or paste a Discord user ID. Lets the member be linked automatically when they log in."
        autoComplete="off"
        style={style}
      />
      {value && (
        <div
          style={{
            fontSize: 12,
            marginTop: 4,
            color: SAGE_DEEP,
            fontFamily: FONT_SERIF,
          }}
        >
          {pickedLabel ? `Linked to ${pickedLabel}` : "Discord ID set"}
        </div>
      )}
      {open && suggestions.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 20,
            marginTop: 4,
            background: PAPER,
            color: INK,
            border: `1px solid ${SAGE}`,
            borderRadius: 10,
            boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
            overflow: "hidden",
            fontFamily: FONT_SERIF,
          }}
        >
          {suggestions.map((m) => (
            <div
              key={m.discordId}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(m);
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = `${SAGE}66`)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              style={{ padding: "8px 12px", cursor: "pointer", fontSize: 14 }}
            >
              {m.displayName || m.username}
              <span style={{ opacity: 0.6 }}> @{m.username}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
