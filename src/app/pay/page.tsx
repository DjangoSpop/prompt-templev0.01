import type { Metadata } from "next";
import PayClient from "./PayClient";

// Paddle's "default payment link" points here. The backend sends buyers to /pay?_ptxn=txn_...&next=/billing
// and Paddle.js opens the checkout for that transaction by itself.
export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function PayPage() {
  return <PayClient />;
}
