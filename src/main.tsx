import React from "react";
import { createRoot } from "react-dom/client";
import { initSentry } from './lib/sentry';
import { initAnalytics } from './lib/analytics';
import { redirectWwwToRoot, redirectVanityPreviewToPublished } from './lib/subdomain-utils';
import App from "./App.tsx";
import "./index.css";

// Redirect vanity preview hosts to published host before app initialization
// This prevents blank pages on preview-- hosts that don't serve the app bundle
if (redirectVanityPreviewToPublished()) {
  // Stop execution if redirecting - page will reload on published host
  throw new Error('Redirecting to published host');
}

// Redirect www to root domain before app initialization
// This prevents CDN caching issues between subdomains
if (redirectWwwToRoot()) {
  // Stop execution if redirecting - page will reload on root domain
  throw new Error('Redirecting to root domain');
}

// Initialize Sentry for error tracking
initSentry();

// Initialize analytics (GA4)
initAnalytics();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
