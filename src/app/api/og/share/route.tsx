/**
 * Default OG Image for Share Links
 *
 * Fallback OG image used when artifact is not available or
 * for general sharing promotions.
 */

import { ImageResponse } from 'next/og';
import { NextResponse } from 'next/server';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function GET() {
  try {
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
            fontFamily: 'sans-serif',
            position: 'relative',
            padding: '60px',
          }}
        >
          {/* Branding */}
          <div
            style={{
              fontSize: '18px',
              color: '#C5A55A',
              marginBottom: '24px',
              letterSpacing: '8px',
              textTransform: 'uppercase' as const,
              fontWeight: 600,
              display: 'flex',
            }}
          >
            PROMPT TEMPLE
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
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <span>Share Your</span>
            <span style={{ color: '#2DD4A8' }}>Masterpieces</span>
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
              display: 'flex',
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
              <span>Instant Optimization</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Smart Templates</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Model Comparison</span>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              fontSize: '16px',
              color: 'rgba(235, 213, 167, 0.4)',
              display: 'flex',
            }}
          >
            prompt-temple.com
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error('OG image generation failed:', e);
    return NextResponse.json(
      { error: 'Failed to generate image', details: String(e) },
      { status: 500 }
    );
  }
}
