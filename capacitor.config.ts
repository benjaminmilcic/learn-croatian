import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.benjaminmilcic.learnverbs',
  appName: 'learn-verbs',
  webDir: 'www',
  plugins: {
    StatusBar: {
      overlaysWebView: false,
    },
  },
};

export default config;
