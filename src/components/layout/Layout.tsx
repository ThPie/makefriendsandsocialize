import { forwardRef, ReactNode, memo } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { SkipLink } from '@/components/ui/skip-link';
import { JsonLd } from '@/components/common/JsonLd';
import { PageTransition } from '@/components/ui/page-transition';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = memo(forwardRef<HTMLDivElement, LayoutProps>(({ children }, ref) => {
  return (
    <div ref={ref} className="min-h-screen flex flex-col">
      <JsonLd />
      <SkipLink />
      <Header />
      <main id="main-content" className="flex-1">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}));

Layout.displayName = 'Layout';
