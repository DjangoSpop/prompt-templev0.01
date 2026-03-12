/**
 * Optimization Result OG Image
 *
 * Dynamic OG image for prompt optimization results showing
 * before/after score transformation.
 */

import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const beforeScore = parseFloat(searchParams.get('beforeScore') || '2.5');
  const afterScore = parseFloat(searchParams.get('afterScore') || '9.2');
  const wowScore = parseFloat(searchParams.get('wowScore') || '8.5');
  const improvements = searchParams.get('improvements')
    ?.split('|')
    .slice(0, 3) || ['Clarity', 'Specificity', 'Structure'];
  const mode = searchParams.get('mode') || 'fast';

  const scoreJump = `${beforeScore.toFixed(1)} → ${afterScore.toFixed(1)}`;
  const improvement = afterScore - beforeScore;

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
        {/* Branding */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            left: '60px',
            fontSize: '14px',
            color: 'rgba(197, 165, 90, 0.7)',
            letterSpacing: '6px',
            textTransform: 'uppercase',
          }}
        >
          Prompt Temple
        </div>

        {/* Main Title */}
        <div
          style={{
            fontSize: '16px',
            color: 'rgba(235, 213, 167, 0.7)',
            marginBottom: '24px',
            letterSpacing: '4px',
            textTransform: 'uppercase',
          }}
        >
          Prompt Optimization
        </div>

        <div
          style={{
            fontSize: '48px',
            fontWeight: 700,
            color: '#E6D5A8',
            marginBottom: '40px',
            textAlign: 'center',
            lineHeight: 1.1,
          }}
        >
          From Apprentice
          <br />
          to Pharaoh Level
        </div>

        {/* Score Comparison */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '40px',
            marginBottom: '48px',
          }}
        >
          {/* Before Score */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '14px',
                color: 'rgba(235, 213, 167, 0.6)',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '2px',
              }}
            >
              Before
            </div>
            <div
              style={{
                fontSize: '64px',
                fontWeight: 700,
                color: '#6B7280',
                lineHeight: 1,
              }}
            >
              {beforeScore.toFixed(1)}
            </div>
          </div>

          {/* Arrow */}
          <div
            style={{
              fontSize: '56px',
              color: '#2DD4A8',
              filter: 'drop-shadow(0 0 10px rgba(45, 212, 168, 0.3))',
            }}
          >
            →
          </div>

          {/* After Score */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '14px',
                color: 'rgba(235, 213, 167, 0.6)',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '2px',
              }}
            >
              After
            </div>
            <div
              style={{
                fontSize: '64px',
                fontWeight: 700,
                color: '#2DD4A8',
                lineHeight: 1,
                filter: 'drop-shadow(0 0 20px rgba(45, 212, 168, 0.4))',
              }}
            >
              {afterScore.toFixed(1)}
            </div>
          </div>
        </div>

        {/* Wow Score Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'linear-gradient(135deg, rgba(197, 165, 90, 0.15) 0%, rgba(197, 165, 90, 0.05) 100%)',
            border: '2px solid #C5A55A',
            borderRadius: '14px',
            padding: '18px 36px',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              fontSize: '32px',
              filter: 'drop-shadow(0 0 8px rgba(197, 165, 90, 0.3))',
            }}
          >
            ⭐
          </div>
          <div>
            <div
              style={{
                fontSize: '12px',
                color: 'rgba(235, 213, 167, 0.6)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Wow Score
            </div>
            <div
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#E6D5A8',
              }}
            >
              {wowScore.toFixed(1)}/10
            </div>
          </div>
        </div>

        {/* Improvements */}
        <div
          style={{
            display: 'flex',
            gap: '24px',
            maxWidth: '700px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {improvements.map((imp, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(45, 212, 168, 0.08)',
                border: '1px solid rgba(45, 212, 168, 0.2)',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '14px',
                color: '#2DD4A8',
                fontWeight: 500,
              }}
            >
              {imp}
            </div>
          ))}
        </div>

        {/* Improvement Badge */}
        {improvement > 0 && (
          <div
            style={{
              marginTop: '32px',
              fontSize: '16px',
              color: 'rgba(235, 213, 167, 0.5)',
            }}
          >
            +{improvement.toFixed(1)} point improvement
          </div>
        )}

        {/* Mode Badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '60px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '12px',
            color: 'rgba(235, 213, 167, 0.5)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          {mode} optimization
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
