import * as Sentry from '@sentry/react';

// Initialize Sentry
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    if (import.meta.env.DEV) console.log('[Sentry] DSN not configured, error tracking disabled');
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0, // 10% in production, 100% in development

    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

    // Only send errors in production or if explicitly enabled
    enabled: import.meta.env.PROD || import.meta.env.VITE_SENTRY_ENABLED === 'true',

    // Filter out common non-actionable errors
    beforeSend(event, hint) {
      const error = hint.originalException as Error;

      // Ignore network errors that are expected
      if (error?.message?.includes('Failed to fetch')) {
        return null;
      }

      // Ignore cancelled requests
      if (error?.message?.includes('AbortError')) {
        return null;
      }

      return event;
    },
  });

  if (import.meta.env.DEV) console.log('[Sentry] Initialized successfully');
}

// Performance transaction helpers
export function startTransaction(name: string, op: string) {
  return Sentry.startSpan({ name, op }, () => { });
}

export function setUserContext(userId: string, email?: string) {
  Sentry.setUser({ id: userId, email });
}

export function clearUserContext() {
  Sentry.setUser(null);
}

export function captureError(error: Error, context?: Record<string, unknown>) {
  if (context) {
    Sentry.withScope((scope) => {
      scope.setExtras(context);
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}

export { Sentry };
