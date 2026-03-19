import { forwardRef, ReactNode, memo } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { SkipLink } from '@/components/ui/skip-link';
import { JsonLd } from '@/components/common/JsonLd';
import { PageTransition } from '@/components/ui/page-transition';
import { useNativeAppContext } from '@/components/native/NativeAppProvider';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = memo(forwardRef<HTMLDivElement, LayoutProps>(({ children }, ref) => {
  const { isNative } = useNativeAppContext();

  // In native app mode, strip web chrome (header, footer) for a native feel
  if (isNative) {
    return (
      <div ref={ref} className="min-h-screen flex flex-col bg-background">
        <main id="main-content" className="flex-1" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    );
  }

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
