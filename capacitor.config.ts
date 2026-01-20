import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c4cc7ef9b4c34c978cd0fc758a50847e',
  appName: 'MakeFriends',
  webDir: 'dist',
  
  // Hot-reload from Lovable preview during development
  server: {
    url: 'https://c4cc7ef9-b4c3-4c97-8cd0-fc758a50847e.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  
  // iOS specific configuration
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#1a1a1a',
    preferredContentMode: 'mobile',
    scheme: 'MakeFriends'
  },
  
  // Android specific configuration
  android: {
    backgroundColor: '#1a1a1a',
    allowMixedContent: true,
    captureInput: true
  },
  
  // Plugin configurations
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#1a1a1a',
      androidSplashResourceName: 'splash',
      showSpinner: false
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1a1a1a'
    }
  }
};

export default config;
