import type { Metadata } from "next";
import { CartPage } from "@/components/cart-page";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review selected products before checkout.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartRoute() {
  return (
    <main className="pt-24 section-space">
      <div className="container-shell">
        <CartPage />
      </div>
    </main>
  );
}
