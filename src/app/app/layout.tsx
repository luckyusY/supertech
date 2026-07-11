import type { ReactNode } from "react";
import { AppBottomTabs } from "@/components/app-bottom-tabs";
import { NativeAppBridge } from "@/components/native-app-bridge";

export default function AppShellLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell min-h-screen bg-[var(--background)] pb-24 text-[var(--foreground)]">
      <NativeAppBridge />
      {children}
      <AppBottomTabs />
    </div>
  );
}
