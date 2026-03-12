import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Handle route changes by scrolling to top and managing focus.
 * Critical for single-page applications and screen reader context.
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Focus main content for accessibility and reset scroll
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      // Reset internal scroll container
      mainContent.scrollTo(0, 0);

      // Make it focusable if not already
      if (!mainContent.hasAttribute('tabindex')) {
        mainContent.setAttribute('tabindex', '-1');
      }
      mainContent.focus();
    } else {
      // Fallback for pages not using the standard layout
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
};
