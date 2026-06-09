import type { CapacitorConfig } from "@capacitor/cli";

/**
 * SuperTech native shell (Capacitor).
 *
 * `server.url` points the native app at the LIVE website, so every content
 * change ships from the web with no Google Play review. We only re-submit to
 * Play when the native shell itself changes (new plugin, icon, target SDK).
 *
 * `webDir` is required by the CLI; we keep it tiny (an offline fallback page)
 * so the native binary stays small.
 */
const config: CapacitorConfig = {
  appId: "africa.supertech.marketplace",
  appName: "SuperTech",
  webDir: "capacitor-www",
  server: {
    url: "https://www.supertech.africa/app",
    androidScheme: "https",
  },
  android: {
    backgroundColor: "#f3f6f2",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: false,
      backgroundColor: "#102019",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
  },
};

export default config;
