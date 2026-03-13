import React from "react";
import { createRoot } from "react-dom/client";
import { initSentry } from './lib/sentry';
import { initAnalytics } from './lib/analytics';
import { redirectWwwToRoot, redirectVanityPreviewToPublished } from './lib/subdomain-utils';
import App from "./App.tsx";
import "./index.css";

// Redirect vanity preview hosts to published host before app initialization
// This prevents blank pages on preview-- hosts that don't serve the app bundle
// Check for redirects before initialization
const isRedirecting = redirectVanityPreviewToPublished() || redirectWwwToRoot();

if (!isRedirecting) {
  // Initialize Sentry for error tracking
  initSentry();
  // Initialize analytics (GA4)
  initAnalytics();
  createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
