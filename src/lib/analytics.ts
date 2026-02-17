import { supabase } from '@/integrations/supabase/client';

// Session ID management
let sessionId: string | null = null;

function getSessionId(): string {
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
  return sessionId;
}

// Google Analytics 4
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function initGA4(measurementId: string) {
  if (!measurementId || typeof window === 'undefined') return;

  // Load gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: true,
    cookie_flags: 'SameSite=None;Secure',
  });

  if (import.meta.env.DEV) console.log('[Analytics] GA4 initialized');
}

// Track page views
export function trackPageView(path: string, title?: string) {
  window.gtag?.('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
  });
}

// Key events for conversion tracking
export type AnalyticsEvent =
  | 'signup'
  | 'login'
  | 'event_registration'
  | 'subscription_purchase'
  | 'trial_started'
  | 'profile_completed'
  | 'match_revealed'
  | 'connection_requested'
  | 'business_listed';

interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

// Track events to both GA4 and database
export async function trackEvent(
  eventName: AnalyticsEvent | string,
  properties?: EventProperties
) {
  try {
    // Track to GA4
    window.gtag?.('event', eventName, properties);

    // Track to database for our own analytics
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('analytics_events').insert({
      user_id: user?.id || null,
      session_id: getSessionId(),
      event_name: eventName,
      event_properties: properties || {},
      page_url: window.location.href,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
    });

    if (import.meta.env.DEV) console.log('[Analytics] Event tracked:', eventName, properties);
  } catch (error) {
    console.error('[Analytics] Failed to track event:', error);
  }
}

// Conversion funnel tracking
export const ConversionFunnels = {
  // User acquisition funnel
  acquisition: {
    steps: ['landing_page', 'signup_started', 'signup_completed', 'onboarding_started', 'onboarding_completed'],
    track: async (step: string) => {
      await trackEvent('funnel_acquisition', { step, funnel: 'acquisition' });
    },
  },

  // Subscription funnel
  subscription: {
    steps: ['pricing_viewed', 'plan_selected', 'checkout_started', 'payment_completed'],
    track: async (step: string, tier?: string) => {
      await trackEvent('funnel_subscription', { step, funnel: 'subscription', tier });
    },
  },

  // Event registration funnel
  eventRegistration: {
    steps: ['event_viewed', 'registration_started', 'registration_completed'],
    track: async (step: string, eventId?: string) => {
      await trackEvent('funnel_event_registration', { step, funnel: 'event_registration', eventId });
    },
  },

  // Dating funnel
  dating: {
    steps: ['dating_page_viewed', 'intake_started', 'intake_completed', 'match_received', 'match_revealed', 'date_scheduled'],
    track: async (step: string) => {
      await trackEvent('funnel_dating', { step, funnel: 'dating' });
    },
  },
};

// User identification for analytics
export function identifyUser(userId: string, traits?: Record<string, unknown>) {
  window.gtag?.('set', 'user_properties', {
    user_id: userId,
    ...traits,
  });
}

// E-commerce tracking
export function trackPurchase(
  transactionId: string,
  value: number,
  currency: string = 'USD',
  items?: Array<{ name: string; price: number; quantity: number }>
) {
  window.gtag?.('event', 'purchase', {
    transaction_id: transactionId,
    value,
    currency,
    items: items?.map((item, index) => ({
      item_id: `item_${index}`,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  });

  trackEvent('subscription_purchase', {
    transaction_id: transactionId,
    value,
    currency,
  });
}

// Initialize analytics
export function initAnalytics() {
  const ga4Id = import.meta.env.VITE_GA4_MEASUREMENT_ID;

  if (ga4Id) {
    initGA4(ga4Id);
  } else {
    if (import.meta.env.DEV) console.log('[Analytics] GA4 measurement ID not configured');
  }
}
