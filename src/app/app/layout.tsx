import type { ReactNode } from "react";
import { AppBottomTabs } from "@/components/app-bottom-tabs";
import { NativeAppBridge } from "@/components/native-app-bridge";

export default function AppShellLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell min-h-screen bg-[#f3f6f2] pb-24 text-[#102019]">
      <NativeAppBridge />
      {children}
      <AppBottomTabs />
    </div>
  );
}
