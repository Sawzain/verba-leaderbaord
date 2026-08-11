import { OLIVE_LIGHT } from "../theme";

export const buttonInteractionStyles = `
  .verba-btn {
    transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease, opacity 0.15s ease, color 0.15s ease, filter 0.15s ease;
  }
  .verba-btn:hover {
    transform: translateY(-1px);
    filter: brightness(1.06);
  }
  .verba-btn:active {
    transform: translateY(0);
    filter: brightness(0.96);
  }
  .verba-btn:disabled {
    transform: none;
    filter: none;
  }

  .verba-btn-elevated:hover {
    transform: translateY(-2px);
    filter: none;
    box-shadow: 0 10px 26px rgba(45, 60, 45, 0.18);
  }
  .verba-btn-elevated:active {
    transform: translateY(0);
    filter: none;
    box-shadow: 0 4px 14px rgba(45, 60, 45, 0.14);
    opacity: 0.9;
  }

  .verba-btn-outline:hover {
    background: ${OLIVE_LIGHT}22;
  }
  .verba-btn-outline:active {
    background: ${OLIVE_LIGHT}3a;
  }

  .verba-link-btn {
    transition: opacity 0.15s ease, color 0.15s ease;
  }
  .verba-link-btn:hover {
    opacity: 0.7;
  }
  .verba-link-btn:active {
    opacity: 0.5;
  }

  .verba-row {
    transition: background 0.15s ease;
  }
  .verba-row:hover {
    background: rgba(255,255,255,0.55);
  }

  @keyframes verba-fade-up {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .verba-fade-in {
    animation: verba-fade-up 0.25s ease both;
  }
`;
