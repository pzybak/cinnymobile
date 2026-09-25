import type { CapacitorConfig } from '@capacitor/cli';

// Shared config for Android and iOS. Keep platform-specific settings in the
// `android` / `ios` blocks so both shells stay in sync.
const config: CapacitorConfig = {
  // Placeholder ID and name; pick final values before the first store upload
  // (the app ID cannot change after publishing).
  appId: 'io.github.pzybak.cinnymobile',
  appName: 'Cinny Mobile',
  webDir: 'dist',
  server: {
    // Serve the bundle from https://localhost so secure-context APIs
    // (crypto.subtle, IndexedDB, service workers) behave like the web build.
    androidScheme: 'https',
    iosScheme: 'capacitor',
  },
  ios: {
    // Safe-area insets are handled in CSS (viewport-fit=cover), not natively.
    contentInset: 'never',
  },
};

export default config;
