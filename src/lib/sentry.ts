import * as Sentry from '@sentry/react';

// Initialize Sentry
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN || 'https://cf8bbe3c67bf3ce60233665166599471@o4511056148299776.ingest.us.sentry.io/4511056164683776';

  if (!dsn) {
    if (import.meta.env.DEV) console.log('[Sentry] DSN not configured, error tracking disabled');
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION || '1.0.0',
    debug: false,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: import.meta.env.PROD ? 0.05 : 1.0, // Reduced to 5% in production for budget safety

    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

    // Only send errors in production or if explicitly enabled
    enabled: import.meta.env.PROD || import.meta.env.VITE_SENTRY_ENABLED === 'true',

    // Filter out common non-actionable errors
    beforeSend(event, hint) {
      const error = hint.originalException as Error;
      const message = error?.message?.toLowerCase() || '';

      // Ignore network connectivity issues
      if (
        message.includes('failed to fetch') ||
        message.includes('networkerror') ||
        message.includes('load failed')
      ) {
        return null;
      }

      // Ignore cancelled requests
      if (message.includes('aborterror') || message.includes('request was aborted')) {
        return null;
      }

      // Add deployment metadata to the event
      event.tags = {
        ...event.tags,
        'app.platform': 'web',
        'app.version': import.meta.env.VITE_APP_VERSION || 'unknown'
      };

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
