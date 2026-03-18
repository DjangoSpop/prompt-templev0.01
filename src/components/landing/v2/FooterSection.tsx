'use client';

import Link from 'next/link';
import { COPY } from '@/lib/landing/copy';

const { footer } = COPY;

export function FooterSection() {
  return (
    <footer className="landing-footer bg-stone-800 dark:bg-[#0A0B0D] text-stone-300 pt-16 pb-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">&#x1F3DB;&#xFE0F;</span>
              <span className="text-xl font-bold text-white">
                {footer.brand}
              </span>
            </div>
            <p className="text-stone-400 mb-4">{footer.tagline}</p>
            <Link
              href={footer.chromeStoreHref}
              className="inline-flex items-center gap-2 text-sm text-[#CBA135] dark:text-[#E9C25A] hover:text-[#d4a853] dark:hover:text-[#F5D68A] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" />
                <line x1="21.17" y1="8" x2="12" y2="8" />
                <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
                <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
              </svg>
              {footer.chromeStore}
            </Link>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-2">
              {footer.links.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-stone-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-2">
              {footer.links.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-stone-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-stone-700 dark:border-stone-800 pt-6 text-center text-stone-500 text-sm">
          {footer.copyright}
        </div>
      </div>
    </footer>
  );
}

export default FooterSection;
