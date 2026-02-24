import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const before = searchParams.get('before') || '2.0';
  const after = searchParams.get('after') || '9.4';
  const beforePrompt = searchParams.get('bp') || 'Write me a marketing email.';
  const afterPrompt =
    searchParams.get('ap') ||
    'Act as a senior conversion copywriter. Write a compelling email targeting CTOs...';
  const improvements = (searchParams.get('imp') || 'Role Injection,Chain-of-Thought,Output Format').split(',');

  const beforeScore = parseFloat(before);
  const afterScore = parseFloat(after);

  function getLabel(score: number): string {
    if (score >= 9) return 'Pharaoh 𓋹';
    if (score >= 7.5) return 'High Priest 𓊹';
    if (score >= 6) return 'Vizier';
    if (score >= 4) return 'Scribe';
    return 'Apprentice';
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          background: '#0D0D0D',
          fontFamily: 'serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Gold border frame */}
        <div style={{
          position: 'absolute', inset: 0, border: '3px solid #F5C518',
          borderRadius: 24, margin: 12, opacity: 0.6
        }} />
        {/* Corner ornaments */}
        {[
          { top: 20, left: 20 }, { top: 20, right: 20 },
          { bottom: 20, left: 20 }, { bottom: 20, right: 20 },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: 'absolute', ...pos,
              width: 32, height: 32,
              background: '#F5C518',
              borderRadius: 4,
              opacity: 0.7,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: '#000',
            }}
          >
            𓂀
          </div>
        ))}

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '32px 56px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              fontSize: 28, color: '#F5C518', fontWeight: 800,
              letterSpacing: 2,
            }}>
              𓏲 PROMPTTEMPLE
            </div>
          </div>
          <div style={{
            fontSize: 14, color: '#9CA3AF',
            background: 'rgba(245,197,24,0.1)',
            border: '1px solid rgba(245,197,24,0.3)',
            padding: '6px 16px', borderRadius: 99,
          }}>
            AI Prompt Optimizer
          </div>
        </div>

        {/* Main content */}
        <div style={{
          flex: 1, display: 'flex', gap: 24,
          padding: '0 56px 24px',
        }}>
          {/* Before panel */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 16,
            padding: 28,
            position: 'relative',
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 3,
              color: '#6B7280', textTransform: 'uppercase', marginBottom: 12,
            }}>
              Before
            </div>
            <div style={{
              fontSize: 15, color: '#9CA3AF', lineHeight: 1.6,
              fontFamily: 'monospace', flex: 1,
              display: '-webkit-box',
              overflow: 'hidden',
            }}>
              {beforePrompt.slice(0, 200)}
            </div>
            <div style={{
              marginTop: 16, display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                fontSize: 28, fontWeight: 800, color: '#EF4444',
              }}>
                {beforeScore.toFixed(1)}
              </div>
              <div style={{ fontSize: 14, color: '#6B7280' }}>/ 10 · Apprentice</div>
            </div>
          </div>

          {/* Arrow */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 60,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'linear-gradient(135deg, #F5C518, #C9A227)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, color: '#000', fontWeight: 900,
              boxShadow: '0 0 30px rgba(245,197,24,0.6)',
            }}>
              →
            </div>
          </div>

          {/* After panel */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            background: 'rgba(245,197,24,0.04)',
            border: '1px solid rgba(245,197,24,0.25)',
            borderRadius: 16,
            padding: 28,
            boxShadow: '0 0 30px rgba(245,197,24,0.1)',
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 3,
              color: '#F5C518', textTransform: 'uppercase', marginBottom: 12,
            }}>
              After ✦
            </div>
            <div style={{
              fontSize: 14, color: '#E5E7EB', lineHeight: 1.7,
              fontFamily: 'monospace', flex: 1,
              display: '-webkit-box',
              overflow: 'hidden',
            }}>
              {afterPrompt.slice(0, 220)}
            </div>
            <div style={{
              marginTop: 16, display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                fontSize: 28, fontWeight: 800, color: '#F5C518',
                textShadow: '0 0 20px rgba(245,197,24,0.8)',
              }}>
                {afterScore.toFixed(1)}
              </div>
              <div style={{ fontSize: 14, color: '#D4B896' }}>/ 10 · {getLabel(afterScore)}</div>
            </div>
          </div>
        </div>

        {/* Improvement tags */}
        <div style={{
          display: 'flex', gap: 10, padding: '0 56px',
          flexWrap: 'nowrap', overflow: 'hidden',
        }}>
          {improvements.slice(0, 5).map((tag, i) => (
            <div
              key={i}
              style={{
                fontSize: 12, fontWeight: 600,
                color: '#F5C518',
                background: 'rgba(245,197,24,0.1)',
                border: '1px solid rgba(245,197,24,0.3)',
                padding: '4px 12px', borderRadius: 99,
              }}
            >
              +{tag.trim()}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 56px 32px',
          color: '#4B5563', fontSize: 13,
        }}>
          <span>prompttemple.com · Where Every Prompt Becomes Sacred</span>
          <span style={{ color: '#F5C518', opacity: 0.6 }}>𓂀 𓊪𓏏𓇯</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
