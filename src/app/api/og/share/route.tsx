/**
 * Default OG Image for Share Links
 *
 * Fallback OG image used when artifact is not available or
 * for general sharing promotions.
 */

import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0E0E10 0%, #1A1A2E 50%, #0E0E10 100%)',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
          position: 'relative',
          padding: '60px',
        }}
      >
        {/* Eye of Horus Icon */}
        <div
          style={{
            fontSize: '64px',
            marginBottom: '32px',
            filter: 'drop-shadow(0 0 20px rgba(197, 165, 90, 0.3))',
          }}
        >
          𓂀
        </div>

        {/* Branding */}
        <div
          style={{
            fontSize: '18px',
            color: '#C5A55A',
            marginBottom: '24px',
            letterSpacing: '8px',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          Prompt Temple
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '56px',
            fontWeight: 700,
            color: '#E6D5A8',
            marginBottom: '20px',
            textAlign: 'center',
            lineHeight: 1.1,
          }}
        >
          Share Your
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #2DD4A8 0%, #14B8A6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Masterpieces
          </span>
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: '20px',
            color: 'rgba(235, 213, 167, 0.7)',
            textAlign: 'center',
            maxWidth: '700px',
            lineHeight: 1.6,
            marginBottom: '48px',
          }}
        >
          Transform prompts into viral content with AI-powered optimization
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: '32px',
            fontSize: '16px',
            color: 'rgba(235, 213, 167, 0.6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚡</span>
            <span>Instant Optimization</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🎯</span>
            <span>Smart Templates</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🔄</span>
            <span>Model Comparison</span>
          </div>
        </div>

        {/* Decorative Line */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            width: '200px',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(197, 165, 90, 0.5), transparent)',
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
