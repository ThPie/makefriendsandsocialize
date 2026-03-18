import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface UpgradeContextValue {
  isUpgradeOpen: boolean;
  openUpgrade: () => void;
  closeUpgrade: () => void;
}

const UpgradeContext = createContext<UpgradeContextValue | null>(null);

export function UpgradeProvider({ children }: { children: ReactNode }) {
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  const openUpgrade = useCallback(() => setIsUpgradeOpen(true), []);
  const closeUpgrade = useCallback(() => setIsUpgradeOpen(false), []);

  return (
    <UpgradeContext.Provider value={{ isUpgradeOpen, openUpgrade, closeUpgrade }}>
      {children}
    </UpgradeContext.Provider>
  );
}

export function useUpgrade() {
  const ctx = useContext(UpgradeContext);
  if (!ctx) throw new Error('useUpgrade must be used within UpgradeProvider');
  return ctx;
}
