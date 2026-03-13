import React from "react";
import { createRoot } from "react-dom/client";
import { redirectWwwToRoot, redirectVanityPreviewToPublished } from './lib/subdomain-utils';
import App from "./App.tsx";
import "./index.css";

// Redirect vanity preview hosts to published host before app initialization
// This prevents blank pages on preview-- hosts that don't serve the app bundle
const isRedirecting = redirectVanityPreviewToPublished() || redirectWwwToRoot();

if (!isRedirecting) {
  // Render the app immediately — don’t block on Sentry/Analytics init
  createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // Defer Sentry and Analytics until after first paint to keep them out of the critical path
  const deferInit = () => {
    import('./lib/sentry').then(({ initSentry }) => initSentry());
    import('./lib/analytics').then(({ initAnalytics }) => initAnalytics());
  };

  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(deferInit);
  } else {
    setTimeout(deferInit, 1000);
  }
}
