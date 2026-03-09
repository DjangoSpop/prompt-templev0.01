/**
 * Certificate Verification Landing Page
 *
 * Allows manual entry of verification codes.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, GraduationCap, ArrowRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VerifyCertificateLandingPage() {
  const router = useRouter();
  const [code, setCode] = useState('');

  const handleVerify = () => {
    const trimmed = code.trim();
    if (trimmed) {
      router.push(`/verify-certificate/${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-obsidian-950 via-obsidian-900 to-obsidian-950">
      {/* Header */}
      <div className="border-b border-royal-gold-500/20">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <Link
            href="/academy"
            className="flex items-center gap-2 text-royal-gold-400 hover:text-royal-gold-300 transition-colors"
          >
            <GraduationCap className="w-5 h-5" />
            <span className="font-semibold text-sm">Prompt Temple Academy</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="max-w-md mx-auto text-center">
          <Shield className="w-16 h-16 text-royal-gold-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-royal-gold-400 mb-3">
            Verify a Certificate
          </h1>
          <p className="text-desert-sand-300 mb-8">
            Enter the verification code printed on any Prompt Temple Academy certificate
            to confirm its authenticity.
          </p>

          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="PT-XXXX-XXXX"
              className="w-full px-4 py-3 bg-obsidian-800 border border-royal-gold-500/30 focus:border-royal-gold-500 rounded-xl text-desert-sand-100 placeholder:text-desert-sand-500 outline-none transition-colors text-center font-mono text-lg tracking-wider"
              maxLength={14}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleVerify();
              }}
            />
            <Button
              onClick={handleVerify}
              disabled={!code.trim()}
              className="w-full py-3 bg-gradient-to-r from-royal-gold-500 to-royal-gold-600 hover:from-royal-gold-600 hover:to-royal-gold-700 text-obsidian-950 font-semibold rounded-xl disabled:opacity-50"
            >
              <Search className="w-4 h-4 mr-2" />
              Verify Certificate
            </Button>
          </div>

          {/* CTA */}
          <div className="mt-16 pt-8 border-t border-royal-gold-500/10">
            <p className="text-sm text-desert-sand-400 mb-4">
              Want to earn your own certificate?
            </p>
            <Link href="/academy">
              <Button
                variant="outline"
                className="border-royal-gold-500/30 text-royal-gold-400 hover:bg-royal-gold-500/10 rounded-xl"
              >
                Start Learning
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
