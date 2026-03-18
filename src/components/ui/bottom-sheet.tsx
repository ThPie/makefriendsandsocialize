import { ReactNode } from 'react';
import { Drawer } from 'vaul';
import { cn } from '@/lib/utils';
import { haptic } from '@/lib/haptics';

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  title?: string;
  description?: string;
  /** Snap points for partial-height sheets. E.g. ['50%', 1] */
  snapPoints?: (number | string)[];
  className?: string;
}

export function BottomSheet({
  open,
  onOpenChange,
  children,
  title,
  description,
  snapPoints,
  className,
}: BottomSheetProps) {
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) haptic('light');
    else haptic('selection');
    onOpenChange(newOpen);
  };

  return (
    <Drawer.Root
      open={open}
      onOpenChange={handleOpenChange}
      snapPoints={snapPoints}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content
          className={cn(
            'fixed bottom-0 left-0 right-0 z-50',
            'bg-card border-t border-border rounded-t-[20px]',
            'flex flex-col max-h-[92vh]',
            'focus:outline-none',
            className
          )}
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
          </div>

          {/* Header */}
          {(title || description) && (
            <div className="px-5 pb-3 border-b border-border/50">
              {title && (
                <Drawer.Title className="text-lg font-display font-semibold text-foreground">
                  {title}
                </Drawer.Title>
              )}
              {description && (
                <Drawer.Description className="text-sm text-muted-foreground mt-0.5">
                  {description}
                </Drawer.Description>
              )}
            </div>
          )}

          {/* Content — scrollable */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-5">
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
