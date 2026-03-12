import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Handle route changes by scrolling to top and managing focus.
 * Critical for single-page applications and screen reader context.
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top instantly, bypassing any smooth-scroll CSS
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    document.documentElement.scrollTop = 0;

    // Focus main content for accessibility
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      // Make it focusable if not already
      if (!mainContent.hasAttribute('tabindex')) {
        mainContent.setAttribute('tabindex', '-1');
      }
      mainContent.focus();
    }
  }, [pathname]);

  return null;
};
