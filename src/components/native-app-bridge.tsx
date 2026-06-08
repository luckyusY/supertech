"use client";

import { useEffect } from "react";

/**
 * Wires native-only behaviour into the app shell when running inside the
 * Capacitor container (no-op on the plain website):
 *  - themes the status bar to match the app header
 *  - hides the native splash once the web app is interactive
 *  - fires a light haptic tap on any `.app-tap` element
 *
 * All Capacitor modules are dynamically imported and guarded behind
 * `isNativePlatform()`, so they never run (or affect bundle behaviour) on web.
 */
export function NativeAppBridge() {
  useEffect(() => {
    let cleanup = () => {};

    (async () => {
      const { Capacitor } = await import("@capacitor/core");
      if (!Capacitor.isNativePlatform()) return;

      const [{ StatusBar, Style }, { SplashScreen }, { Haptics, ImpactStyle }] =
        await Promise.all([
          import("@capacitor/status-bar"),
          import("@capacitor/splash-screen"),
          import("@capacitor/haptics"),
        ]);

      // Dark icons on the light app header.
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        if (Capacitor.getPlatform() === "android") {
          await StatusBar.setBackgroundColor({ color: "#f3f6f2" });
        }
      } catch {
        // StatusBar can be unavailable on some devices; ignore.
      }

      try {
        await SplashScreen.hide();
      } catch {
        // ignore
      }

      const onPointerDown = (event: PointerEvent) => {
        const target = event.target as HTMLElement | null;
        if (target?.closest(".app-tap")) {
          Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
        }
      };

      document.addEventListener("pointerdown", onPointerDown, { passive: true });
      cleanup = () => document.removeEventListener("pointerdown", onPointerDown);
    })();

    return () => cleanup();
  }, []);

  return null;
}
