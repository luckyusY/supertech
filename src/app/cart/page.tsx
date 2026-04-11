import type { Metadata } from "next";
import { CartPageShell } from "@/components/cart-page-shell";

export const metadata: Metadata = {
  title: "Cart",
  description:
    "Review your selected items and place your order for fast delivery across East and West Africa.",
};

export default function CartPage() {
  return (
    <div className="page-shell py-8">
      <CartPageShell />
    </div>
  );
}
