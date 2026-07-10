import type { CapacitorConfig } from "@capacitor/cli";

/**
 * SuperTech native shell.
 *
 * The app loads the live production site so content stays in sync with the
 * website without rebuilding the app. `www/` only holds a branded fallback
 * shown if the site can't be reached on first launch.
 */
const config: CapacitorConfig = {
  appId: "africa.supertech.marketplace",
  appName: "SuperTech",
  webDir: "www",
  server: {
    url: "https://www.supertech.africa/",
    cleartext: false,
    // Open these hosts inside the app's webview; everything else (WhatsApp,
    // payment USSD, external links) is handed off to the OS.
    allowNavigation: ["www.supertech.africa", "supertech.africa"],
  },
  android: {
    backgroundColor: "#f1f1f2",
  },
  ios: {
    backgroundColor: "#f1f1f2",
    contentInset: "always",
    limitsNavigationsToAppBoundDomains: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: "#f1f1f2",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
    },
  },
};

export default config;
