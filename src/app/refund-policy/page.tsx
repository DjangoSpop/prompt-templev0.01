import type { Metadata } from "next";
import Link from "next/link";
import { AppLayoutWithSidebar } from "@/components/sidebar/AppLayoutWithSidebar";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Prompt Temple paid plans and digital products come with a 14-day money-back guarantee.",
  alternates: { canonical: "https://prompt-temple.com/refund-policy" },
};

const UPDATED = "26 October 2026";
const CONTACT = "behodjango@gmail.com";

export default function RefundPolicyPage() {
  return (
    <AppLayoutWithSidebar>
      <article className="mx-auto w-full max-w-3xl space-y-8 px-4 py-10 text-[15px] leading-7 text-stone-700 dark:text-stone-300">
        <header className="space-y-3">
          <h1 className="text-4xl font-bold text-stone-900 dark:text-stone-50">Refund Policy</h1>
          <p className="text-sm text-stone-500">Last updated {UPDATED}</p>
          <p>
            Every paid Prompt Temple plan and digital product comes with a <strong>14-day money-back
            guarantee</strong>. If it isn&apos;t right for you, ask within 14 days of a payment and you get that
            payment back in full. No questions asked.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">How to get a refund</h2>
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              <strong>Plans bought on prompt-temple.com:</strong> our reseller Paddle.com processed your payment.
              Use the link in your Paddle receipt email, or go to{" "}
              <a href="https://paddle.net" className="underline" rel="noopener noreferrer" target="_blank">paddle.net</a>{" "}
              and look up your order, or email us and we will arrange it.
            </li>
            <li>
              <strong>Purchases from our Gumroad store</strong> (such as the prompt book): reply to your Gumroad
              receipt or email us.
            </li>
            <li>
              Email <a href={`mailto:${CONTACT}`} className="underline">{CONTACT}</a> with the email address you
              bought with. We reply within 2 business days.
            </li>
          </ol>
          <p>The money goes back to the card or account you paid with. Banks usually show it within 5 to 10 business
            days.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">Cancelling a subscription</h2>
          <p>Cancelling stops future renewals; it is not a refund by itself. You can cancel at any time from the
            billing page in your account or from your receipt. You keep your paid features until the end of the
            period you have paid for, then your account moves to the Free plan.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">After 14 days</h2>
          <p>Payments older than 14 days are not normally refunded, but if something went wrong (for example you
            were charged after cancelling, or the Service was unavailable for a long time) email us and we will put
            it right.</p>
        </section>

        <p className="text-sm text-stone-500">
          Prompt Temple is a product of Pharaonic Tech. See also our{" "}
          <Link href="/terms" className="underline">Terms of Service</Link> and{" "}
          <Link href="/privacy-policy" className="underline">Privacy Policy</Link>.
        </p>
      </article>
    </AppLayoutWithSidebar>
  );
}
