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
    <div ref={ref} className="h-full w-full flex flex-col overflow-hidden relative">
      <JsonLd />
      <SkipLink />
      <Header />
      <main
        id="main-content"
        className={`flex-1 overflow-y-auto overflow-x-hidden scroll-smooth scroll-touch ${isHome ? 'pt-0' : 'pt-[60px] md:pt-[68px]'}`}
      >
        {children}
        <Footer />
      </main>
    </div>
  );
}));

Layout.displayName = 'Layout';
