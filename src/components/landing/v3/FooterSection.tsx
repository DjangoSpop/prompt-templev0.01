'use client';

import Link from 'next/link';
import { COPY_V3 } from '@/lib/landing/copy-v3';
import Eyehorus from '@/components/pharaonic/Eyehorus';

const { footer } = COPY_V3;

export function FooterSection() {
  return (
    <footer className="bg-stone-900 px-4 pb-8 pt-16 text-stone-300 dark:bg-stone-950">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <Eyehorus
                size={28}
                variant="hero"
                glow
                glowIntensity="low"
                animated={false}
                showLabel={false}
              />
              <span
                className="text-xl font-bold text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {footer.brand}
              </span>
            </div>
            <p className="mb-4 text-stone-400">{footer.tagline}</p>
            <Link
              href={footer.chromeStoreHref}
              className="inline-flex items-center gap-2 text-sm text-[#CBA135] transition-colors hover:text-[#E9C25A]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" />
                <line x1="21.17" y1="8" x2="12" y2="8" />
                <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
                <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
              </svg>
              {footer.chromeStore}
            </Link>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Product
            </h4>
            <ul className="space-y-2.5">
              {footer.links.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-stone-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Company
            </h4>
            <ul className="space-y-2.5">
              {footer.links.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-stone-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-stone-800 pt-6 text-center text-sm text-stone-500">
          {footer.copyright}
        </div>
      </div>
    </footer>
  );
}

export default FooterSection;
