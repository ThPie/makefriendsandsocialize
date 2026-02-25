import { forwardRef, ReactNode, memo } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { SkipLink } from '@/components/ui/skip-link';
import { JsonLd } from '@/components/common/JsonLd';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = memo(forwardRef<HTMLDivElement, LayoutProps>(({ children }, ref) => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div ref={ref} className="min-h-screen flex flex-col">
      <JsonLd />
      <SkipLink />
      <Header />
      <main id="main-content" className={`flex-1 ${isHome ? 'pt-0' : 'pt-[68px]'}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}));

Layout.displayName = 'Layout';
