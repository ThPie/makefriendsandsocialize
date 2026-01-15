import React from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from 'virtual:pwa-register';
import { initSentry } from './lib/sentry';
import { initAnalytics } from './lib/analytics';
import App from "./App.tsx";
import "./index.css";

// Initialize Sentry for error tracking
initSentry();

// Initialize analytics (GA4)
initAnalytics();

// Register service worker with auto-update
const updateSW = registerSW({
  onNeedRefresh() {
    // Dispatch custom event for UpdateAvailable component
    window.dispatchEvent(new CustomEvent('sw-update-available'));
  },
  onOfflineReady() {
    console.log('MakeFriends is ready for offline use');
  },
  onRegistered(registration) {
    if (registration) {
      // Check for updates every hour
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);
    }
  },
  onRegisterError(error) {
    console.error('Service worker registration failed:', error);
  }
});

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
