import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dubbingbase.app',
  appName: 'DubbingBase',
  webDir: 'dist',
  plugins: {
    // Configure the App plugin for deep linking
    App: {
      // This is the custom URL scheme your app will respond to
      customUrlScheme: 'dubbingbase',
      // This is the universal link domain (for iOS)
      iosScheme: 'dubbingbase',
      // This is the app's website domain (for Android App Links)
      androidScheme: 'https',
      // This is the host for universal links (for iOS)
      hostname: 'dubbingbase.app',
      // This is the path prefix for universal links
      path: '/',
      launchUrl: 'dubbingbase://'
    }
  }
};

export default config;
