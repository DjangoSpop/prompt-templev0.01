/**
 * Broadcast Comparison OG Image
 *
 * Dynamic OG image for Multi-AI Broadcast comparison results.
 */

import { ImageResponse } from 'next/og';
import { NextResponse } from 'next/server';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bestModel = searchParams.get('bestModel') || 'Claude 3';
    const providerCount = parseInt(searchParams.get('providers') || '4', 10);
    const providerNames = searchParams.get('providerNames')?.split(',') || [
      'OpenAI', 'Anthropic', 'Google', 'Meta',
    ];

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
              position: 'absolute',
              top: '40px',
              left: '60px',
              fontSize: '14px',
              color: 'rgba(197, 165, 90, 0.7)',
              letterSpacing: '6px',
              display: 'flex',
            }}
          >
            PROMPT TEMPLE
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: '52px',
              fontWeight: 700,
              color: '#E6D5A8',
              marginBottom: '16px',
              textAlign: 'center',
              lineHeight: 1.1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <span style={{ display: 'flex' }}>Which AI Model</span>
            <span style={{ display: 'flex' }}>Performs Best?</span>
          </div>

          <div style={{ fontSize: '18px', color: 'rgba(235, 213, 167, 0.6)', marginBottom: '48px', display: 'flex' }}>
            Tested across {providerCount} models
          </div>

          {/* Best Model Badge */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              border: '3px solid #2DD4A8',
              borderRadius: '16px',
              padding: '28px 56px',
              marginBottom: '48px',
            }}
          >
            <div style={{ fontSize: '14px', color: '#2DD4A8', marginBottom: '8px', letterSpacing: '2px', fontWeight: 600, display: 'flex' }}>
              BEST OVERALL
            </div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#E6D5A8', marginBottom: '8px', display: 'flex' }}>
              {bestModel}
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(235, 213, 167, 0.5)', display: 'flex' }}>
              Based on quality and speed
            </div>
          </div>

          {/* Provider Grid */}
          <div style={{ display: 'flex', gap: '16px', maxWidth: '900px', width: '100%' }}>
            {providerNames.slice(0, 4).map((provider) => (
              <div
                key={provider}
                style={{
                  flex: 1,
                  background: provider === bestModel ? 'rgba(45, 212, 168, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${provider === bestModel ? '#2DD4A8' : 'rgba(255, 255, 255, 0.1)'}`,
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#E6D5A8', display: 'flex' }}>
                  {provider}
                </div>
                {provider === bestModel && (
                  <div style={{ fontSize: '11px', color: '#2DD4A8', fontWeight: 600, display: 'flex' }}>
                    Winner
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ position: 'absolute', bottom: '40px', fontSize: '14px', color: 'rgba(235, 213, 167, 0.4)', display: 'flex' }}>
            Compare models on prompt-temple.com
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (e) {
    console.error('OG broadcast image failed:', e);
    return NextResponse.json({ error: 'Failed to generate image', details: String(e) }, { status: 500 });
  }
}
