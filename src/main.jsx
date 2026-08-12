import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { DANGER_LIGHT, DANGER_DARK } from "./theme";

document.documentElement.style.setProperty("--danger-light", DANGER_LIGHT);
document.documentElement.style.setProperty("--danger-dark", DANGER_DARK);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
