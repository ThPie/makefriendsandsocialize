import React from "react";
import { createRoot } from "react-dom/client";
import { initSentry } from './lib/sentry';
import { initAnalytics } from './lib/analytics';
import App from "./App.tsx";
import "./index.css";

// Initialize Sentry for error tracking
initSentry();

// Initialize analytics (GA4)
initAnalytics();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
