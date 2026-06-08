import { AppBottomTabs } from "@/components/app-bottom-tabs";
import { AppCartPanel } from "@/components/app-cart-panel";

export const dynamic = "force-dynamic";

export default function AppCartPage() {
  return (
    <div className="min-h-screen bg-[#f3f6f2] pb-24 text-[#102019]">
      <header className="sticky top-0 z-40 border-b border-black/6 bg-[#f3f6f2]/92 px-4 py-3 backdrop-blur">
        <div className="mx-auto max-w-md">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#66736b]">
            Checkout
          </p>
          <h1 className="text-2xl font-black tracking-[-0.04em]">Cart</h1>
        </div>
      </header>
      <main className="mx-auto max-w-md px-4 py-4">
        <AppCartPanel />
      </main>
      <AppBottomTabs />
    </div>
  );
}
