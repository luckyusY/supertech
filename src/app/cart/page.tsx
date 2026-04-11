import type { Metadata } from "next";
import { CartPageShell } from "@/components/cart-page-shell";

export const metadata: Metadata = {
  title: "Cart",
  description:
    "Collect multiple marketplace products into one manual quote request before payments go live.",
};

export default function CartPage() {
  return (
    <div className="page-shell py-8">
      <CartPageShell />
    </div>
  );
}
