import { AppCartPanel } from "@/components/app-cart-panel";
import { AppHeader } from "@/components/app-header";

export const dynamic = "force-dynamic";

export default function AppCartPage() {
  return (
    <>
      <AppHeader eyebrow="Checkout" title="Cart" />
      <main className="mx-auto max-w-md px-4 py-4">
        <AppCartPanel />
      </main>
    </>
  );
}
