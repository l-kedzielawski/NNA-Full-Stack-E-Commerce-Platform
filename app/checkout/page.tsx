import type { Metadata } from "next";
import { CheckoutPage } from "@/components/checkout-page";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Enter shipping details and complete your order.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutRoute() {
  return (
    <main className="pt-24 section-space">
      <div className="container-shell">
        <CheckoutPage />
      </div>
    </main>
  );
}
