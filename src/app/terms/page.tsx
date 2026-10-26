import type { Metadata } from "next";
import Link from "next/link";
import { AppLayoutWithSidebar } from "@/components/sidebar/AppLayoutWithSidebar";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms for using Prompt Temple, its Chrome extension and paid plans. Prompt Temple is a product of Pharaonic Tech.",
  alternates: { canonical: "https://prompt-temple.com/terms" },
};

const UPDATED = "26 October 2026";
const CONTACT = "privacy@prompt-temple.com";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="space-y-3 scroll-mt-24">
      <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">{title}</h2>
      <div className="space-y-3 text-[15px] leading-7 text-stone-700 dark:text-stone-300">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <AppLayoutWithSidebar>
      <article className="mx-auto w-full max-w-3xl space-y-10 px-4 py-10">
        <header className="space-y-3">
          <h1 className="text-4xl font-bold text-stone-900 dark:text-stone-50">Terms of Service</h1>
          <p className="text-sm text-stone-500">Last updated {UPDATED}</p>
          <p className="text-[15px] leading-7 text-stone-700 dark:text-stone-300">
            These terms apply to the Prompt Temple website at prompt-temple.com, the Prompt Temple Broadcaster
            Chrome extension and any paid plan (together, the &quot;Service&quot;). The Service is provided by{" "}
            <strong>Pharaonic Tech</strong> (&quot;we&quot;, &quot;us&quot;). By creating an account or using the
            Service you agree to these terms.
          </p>
        </header>

        <Section id="accounts" title="1. Your account">
          <p>You must give a working email address and keep your login details private. You are responsible for
            what happens under your account. You must be old enough to agree to these terms where you live.</p>
        </Section>

        <Section id="plans" title="2. Free and paid plans">
          <p>The Free plan is free. Paid plans (Pro and Power) add more AI credits, models and features, as described
            on the <Link href="/pricing" className="underline">pricing page</Link>. Prices are shown before you pay
            and may include sales tax or VAT depending on where you live.</p>
          <p>Paid plans are subscriptions that renew automatically each billing period until you cancel. You can
            cancel at any time from the billing page or the link in your receipt; you keep access until the end of
            the period you have paid for. AI credits refill each billing period and do not roll over.</p>
        </Section>

        <Section id="payments" title="3. Payments">
          <p>Our order process is conducted by our online reseller <strong>Paddle.com</strong>. Paddle.com is the
            Merchant of Record for all our orders. Paddle provides all customer service inquiries and handles
            returns. Some purchases, such as our prompt book or a plan bought from our Gumroad store, are sold through
            Gumroad instead, which is then the seller of record for that purchase. We never see or store your full
            card details.</p>
        </Section>

        <Section id="refunds" title="4. Refunds">
          <p>Paid plans and digital products come with a 14-day money-back guarantee. See our{" "}
            <Link href="/refund-policy" className="underline">Refund Policy</Link> for how to ask for a refund.</p>
        </Section>

        <Section id="use" title="5. Acceptable use">
          <p>Do not use the Service to break the law, to create content that is harmful, abusive or that infringes
            other people&apos;s rights, to send spam, or to get around usage limits, security or other people&apos;s
            accounts. Do not resell or copy the Service or scrape it in bulk. We may suspend accounts that break
            these rules.</p>
        </Section>

        <Section id="ai" title="6. AI output and third-party AI platforms">
          <p>Prompt Temple helps you write prompts and send them to AI models such as ChatGPT, Claude, Gemini, Grok
            and DeepSeek. AI answers can be wrong, so check anything important before relying on it. We are not
            affiliated with or endorsed by those platforms, and your use of them is governed by their own terms.</p>
          <p>You own the prompts you write. You may use AI output and the templates you save for your own personal
            or business work.</p>
        </Section>

        <Section id="ip" title="7. Our content">
          <p>The Service, its design, code and the Prompt Temple name and logo belong to Pharaonic Tech. Templates in
            the public library may be used in your own work but may not be republished as a competing collection.</p>
        </Section>

        <Section id="liability" title="8. Warranty and liability">
          <p>The Service is provided &quot;as is&quot;. We work to keep it available and accurate but do not promise
            it will be uninterrupted or error-free. To the extent the law allows, we are not liable for indirect or
            consequential losses, and our total liability is limited to the amount you paid us in the 12 months
            before the claim. Nothing in these terms limits rights you have under consumer law.</p>
        </Section>

        <Section id="ending" title="9. Ending your use">
          <p>You can stop using the Service and delete your account at any time. We may suspend or close accounts
            that break these terms; if we close a paid account without a breach on your part, we will refund the
            unused part of the current period.</p>
        </Section>

        <Section id="changes" title="10. Changes">
          <p>We may update these terms. If a change matters for paying users we will tell you by email or in the app
            before it takes effect. Continuing to use the Service after that means you accept the new terms.</p>
        </Section>

        <Section id="contact" title="11. Contact">
          <p>Pharaonic Tech, maker of Prompt Temple. Email{" "}
            <a href={`mailto:${CONTACT}`} className="underline">{CONTACT}</a>. See also our{" "}
            <Link href="/privacy-policy" className="underline">Privacy Policy</Link>.</p>
        </Section>
      </article>
    </AppLayoutWithSidebar>
  );
}
