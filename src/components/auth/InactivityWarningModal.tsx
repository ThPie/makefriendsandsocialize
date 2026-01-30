import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Clock } from 'lucide-react';

interface InactivityWarningModalProps {
  isOpen: boolean;
  remainingSeconds: number;
  onStayLoggedIn: () => void;
  onLogoutNow: () => void;
}

export function InactivityWarningModal({
  isOpen,
  remainingSeconds,
  onStayLoggedIn,
  onLogoutNow,
}: InactivityWarningModalProps) {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center mb-2">
            <Clock className="h-6 w-6 text-warning" />
          </div>
          <AlertDialogTitle className="text-center">
            Session About to Expire
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-2">
            <p>
              For your security, you will be automatically logged out due to inactivity.
            </p>
            <p className="text-2xl font-bold text-foreground">
              {timeDisplay}
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={onLogoutNow} className="flex-1">
            Log Out Now
          </AlertDialogCancel>
          <AlertDialogAction onClick={onStayLoggedIn} className="flex-1">
            Stay Logged In
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
