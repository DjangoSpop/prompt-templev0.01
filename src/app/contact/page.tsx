import type { Metadata } from "next";
import Link from "next/link";
import { AppLayoutWithSidebar } from "@/components/sidebar/AppLayoutWithSidebar";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Prompt Temple (Pharaonic Tech) for support, billing, refunds or privacy requests.",
  alternates: { canonical: "https://prompt-temple.com/contact" },
};

const CONTACT = "behodjango@gmail.com";

export default function ContactPage() {
  return (
    <AppLayoutWithSidebar>
      <article className="mx-auto w-full max-w-3xl space-y-8 px-4 py-10 text-[15px] leading-7 text-stone-700 dark:text-stone-300">
        <header className="space-y-3">
          <h1 className="text-4xl font-bold text-stone-900 dark:text-stone-50">Contact us</h1>
          <p>
            Prompt Temple is made by <strong>Pharaonic Tech</strong>. Questions about your account, the Chrome
            extension, a payment or a refund all go to one inbox, and a person answers within 2 business days.
          </p>
        </header>

        <section className="space-y-2 rounded-2xl border border-stone-200 p-6 dark:border-stone-800">
          <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">Email</h2>
          <p>
            <a href={`mailto:${CONTACT}`} className="text-lg font-medium underline">{CONTACT}</a>
          </p>
          <p className="text-sm text-stone-500">
            Please write from the email address on your Prompt Temple account so we can find it quickly.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">Billing and refunds</h2>
          <p>
            Paid plans bought on prompt-temple.com are sold by our reseller Paddle.com, the merchant of record. You
            can manage or cancel a plan from your billing page, find your receipts at{" "}
            <a href="https://paddle.net" className="underline" rel="noopener noreferrer" target="_blank">paddle.net</a>,
            or email us. Every payment comes with a 14-day money-back guarantee; see the{" "}
            <Link href="/refund-policy" className="underline">Refund Policy</Link>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">Privacy requests</h2>
          <p>
            To export or delete your data, email us with the subject &quot;Privacy request&quot;. Details are in
            our <Link href="/privacy-policy" className="underline">Privacy Policy</Link>.
          </p>
        </section>

        <p className="text-sm text-stone-500">
          See also our <Link href="/terms" className="underline">Terms of Service</Link> and{" "}
          <Link href="/help" className="underline">Help center</Link>.
        </p>
      </article>
    </AppLayoutWithSidebar>
  );
}
