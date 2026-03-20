/**
 * Optimization Result OG Image
 *
 * Dynamic OG image showing before/after score transformation.
 */

import { ImageResponse } from 'next/og';
import { NextResponse } from 'next/server';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const beforeScore = parseFloat(searchParams.get('beforeScore') || '2.5');
    const afterScore = parseFloat(searchParams.get('afterScore') || '9.2');
    const wowScore = parseFloat(searchParams.get('wowScore') || '8.5');
    const improvements = searchParams.get('improvements')
      ?.split('|')
      .slice(0, 3) || ['Clarity', 'Specificity', 'Structure'];
    const mode = searchParams.get('mode') || 'fast';

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

          {/* Mode Badge */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              right: '60px',
              background: mode === 'deep' ? 'rgba(147, 51, 234, 0.15)' : 'rgba(45, 212, 168, 0.15)',
              border: `1px solid ${mode === 'deep' ? '#9333EA' : '#2DD4A8'}`,
              borderRadius: '20px',
              padding: '8px 20px',
              fontSize: '12px',
              color: mode === 'deep' ? '#9333EA' : '#2DD4A8',
              letterSpacing: '1px',
              fontWeight: 600,
              display: 'flex',
            }}
          >
            {mode === 'deep' ? 'DEEP OPTIMIZATION' : 'FAST OPTIMIZATION'}
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#E6D5A8',
              marginBottom: '40px',
              textAlign: 'center',
              display: 'flex',
            }}
          >
            From Apprentice to Pharaoh Level
          </div>

          {/* Score Transformation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '40px',
              marginBottom: '40px',
            }}
          >
            {/* Before Score */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '60px',
                  border: '3px solid #EF4444',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ fontSize: '40px', fontWeight: 700, color: '#EF4444', display: 'flex' }}>
                  {beforeScore.toFixed(1)}
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(235, 213, 167, 0.5)', display: 'flex' }}>
                  BEFORE
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div
              style={{
                fontSize: '48px',
                color: '#2DD4A8',
                display: 'flex',
              }}
            >
              →
            </div>

            {/* After Score */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '60px',
                  border: '3px solid #2DD4A8',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ fontSize: '40px', fontWeight: 700, color: '#2DD4A8', display: 'flex' }}>
                  {afterScore.toFixed(1)}
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(235, 213, 167, 0.5)', display: 'flex' }}>
                  AFTER
                </div>
              </div>
            </div>

            {/* Wow Score */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginLeft: '20px',
              }}
            >
              <div style={{ fontSize: '14px', color: '#F5C518', marginBottom: '8px', fontWeight: 600, display: 'flex' }}>
                Wow Score
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#F5C518', display: 'flex' }}>
                {wowScore.toFixed(1)}
              </div>
            </div>
          </div>

          {/* Improvements */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
            {improvements.map((imp) => (
              <div
                key={imp}
                style={{
                  background: 'rgba(197, 165, 90, 0.1)',
                  border: '1px solid rgba(197, 165, 90, 0.3)',
                  borderRadius: '20px',
                  padding: '8px 20px',
                  fontSize: '13px',
                  color: '#C5A55A',
                  fontWeight: 500,
                  display: 'flex',
                }}
              >
                {imp}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ fontSize: '14px', color: 'rgba(235, 213, 167, 0.4)', display: 'flex' }}>
            Optimize your prompts on prompt-temple.com
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error('OG optimization image failed:', e);
    return NextResponse.json(
      { error: 'Failed to generate image', details: String(e) },
      { status: 500 }
    );
  }
}
