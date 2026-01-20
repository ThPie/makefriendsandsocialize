import { useCapacitor } from '@/hooks/useCapacitor';
import { cn } from '@/lib/utils';

interface SafeAreaProps {
  className?: string;
  children?: React.ReactNode;
}

export function SafeAreaTop({ className, children }: SafeAreaProps) {
  const { isNative, isIOS } = useCapacitor();
  
  if (!isNative) return children ? <>{children}</> : null;
  
  return (
    <div 
      className={cn('w-full', className)} 
      style={{ 
        paddingTop: isIOS ? 'env(safe-area-inset-top)' : '24px' 
      }}
    >
      {children}
    </div>
  );
}

export function SafeAreaBottom({ className, children }: SafeAreaProps) {
  const { isNative, isIOS } = useCapacitor();
  
  if (!isNative) return children ? <>{children}</> : null;
  
  return (
    <div 
      className={cn('w-full', className)}
      style={{ 
        paddingBottom: isIOS ? 'env(safe-area-inset-bottom)' : '16px' 
      }}
    >
      {children}
    </div>
  );
}

export function SafeAreaView({ className, children }: SafeAreaProps) {
  const { isNative, isIOS } = useCapacitor();
  
  if (!isNative) return <>{children}</>;
  
  return (
    <div 
      className={cn('w-full min-h-screen', className)}
      style={{ 
        paddingTop: isIOS ? 'env(safe-area-inset-top)' : '24px',
        paddingBottom: isIOS ? 'env(safe-area-inset-bottom)' : '16px',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)'
      }}
    >
      {children}
    </div>
  );
}
