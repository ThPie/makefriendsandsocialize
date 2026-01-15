import { motion } from 'framer-motion';
import { Download, Smartphone, Monitor, Check, Share, MoreVertical, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';

export default function InstallPage() {
  const { isInstalled, canInstall, install, getInstallInstructions, isStandalone } = usePWA();
  const instructions = getInstallInstructions();

  const handleInstall = async () => {
    await install();
  };

  if (isInstalled || isStandalone) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Check className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-serif text-3xl font-medium text-foreground mb-4">
            Already Installed
          </h1>
          <p className="text-muted-foreground">
            MakeFriends is already installed on your device. You're all set!
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] px-4 py-12">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            <Download className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-serif text-4xl font-medium text-foreground mb-4">
            Install MakeFriends
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Get the full app experience with faster loading, offline access, and push notifications.
          </p>
        </motion.div>

        {/* Native Install Button */}
        {canInstall && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <Button
              size="lg"
              onClick={handleInstall}
              className="w-full h-14 text-lg gap-3"
            >
              <Download className="h-5 w-5" />
              Install Now
            </Button>
          </motion.div>
        )}

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-4 md:grid-cols-3 mb-12"
        >
          {[
            {
              icon: '⚡',
              title: 'Lightning Fast',
              description: 'Loads instantly from your home screen'
            },
            {
              icon: '📱',
              title: 'Native Feel',
              description: 'Full-screen experience like a native app'
            },
            {
              icon: '🔔',
              title: 'Stay Updated',
              description: 'Get notified about events and matches'
            }
          ].map((benefit, index) => (
            <div
              key={index}
              className="rounded-xl border border-border bg-card/50 p-6 text-center"
            >
              <div className="text-3xl mb-3">{benefit.icon}</div>
              <h3 className="font-semibold text-foreground mb-1">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </motion.div>

        {/* Platform-specific Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border bg-card p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            {instructions.platform === 'iOS' ? (
              <Smartphone className="h-6 w-6 text-primary" />
            ) : instructions.platform === 'Android' ? (
              <Smartphone className="h-6 w-6 text-primary" />
            ) : (
              <Monitor className="h-6 w-6 text-primary" />
            )}
            <h2 className="text-xl font-semibold text-foreground">
              Install on {instructions.platform}
            </h2>
          </div>

          <ol className="space-y-4">
            {instructions.steps.map((step, index) => (
              <li key={index} className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {index + 1}
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-foreground">{step}</p>
                  {/* Visual hints for iOS */}
                  {instructions.platform === 'iOS' && index === 0 && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Share className="h-4 w-4" />
                      <span>Look for this icon</span>
                    </div>
                  )}
                  {/* Visual hints for Android */}
                  {instructions.platform === 'Android' && index === 0 && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <MoreVertical className="h-4 w-4" />
                      <span>Look for this icon</span>
                    </div>
                  )}
                  {/* Visual hints for "Add to Home Screen" */}
                  {step.toLowerCase().includes('add to home') && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Plus className="h-4 w-4" />
                      <span>Add to Home Screen option</span>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Having trouble installing?{' '}
            <Link to="/contact" className="text-primary hover:underline">
              Contact support
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
