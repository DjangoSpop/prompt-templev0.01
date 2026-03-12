/**
 * Prompt Share OG Image
 *
 * Dynamic OG image for shared prompts showing the prompt
 * text and quality score.
 */

import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const prompt = searchParams.get('prompt') || 'Write a compelling blog post about AI';
  const score = parseFloat(searchParams.get('score') || '8.5');

  // Truncate prompt if too long
  const displayPrompt = prompt.length > 150 ? `${prompt.slice(0, 150)}...` : prompt;

  // Determine score color
  const getScoreColor = (s: number) => {
    if (s >= 8) return '#2DD4A8'; // Emerald
    if (s >= 6) return '#F5C518'; // Gold
    if (s >= 4) return '#FB923C'; // Orange
    return '#EF4444'; // Red
  };

  const scoreColor = getScoreColor(score);

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

        {/* Type Badge */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            right: '60px',
            background: 'rgba(197, 165, 90, 0.1)',
            border: '1px solid rgba(197, 165, 90, 0.3)',
            borderRadius: '20px',
            padding: '8px 20px',
            fontSize: '12px',
            color: '#C5A55A',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontWeight: 600,
          }}
        >
          Shared Prompt
        </div>

        {/* Main Title */}
        <div
          style={{
            fontSize: '16px',
            color: 'rgba(235, 213, 167, 0.7)',
            marginBottom: '32px',
            letterSpacing: '4px',
            textTransform: 'uppercase',
          }}
        >
          Professional Prompt
        </div>

        {/* Score Display */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '40px',
          }}
        >
          {/* Score Circle */}
          <div
            style={{
              width: '160px',
              height: '160px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${scoreColor}20 0%, ${scoreColor}10 100%)`,
              border: `4px solid ${scoreColor}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 40px ${scoreColor}30`,
            }}
          >
            <div
              style={{
                fontSize: '56px',
                fontWeight: 700,
                color: scoreColor,
                lineHeight: 1,
              }}
            >
              {score.toFixed(1)}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'rgba(235, 213, 167, 0.6)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Quality Score
            </div>
          </div>

          {/* Score Label */}
          <div
            style={{
              fontSize: '14px',
              color: 'rgba(235, 213, 167, 0.5)',
            }}
          >
            {score >= 8 ? '⭐ Pharaoh Level' : score >= 6 ? '✨ Expert' : '📝 Good'}
          </div>
        </div>

        {/* Prompt Preview */}
        <div
          style={{
            maxWidth: '800px',
            width: '100%',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '28px 36px',
              fontSize: '16px',
              color: '#E6D5A8',
              lineHeight: 1.7,
              fontStyle: 'italic',
            }}
          >
            "{displayPrompt}"
          </div>
        </div>

        {/* Action Buttons Preview */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(197, 165, 90, 0.1)',
              border: '1px solid rgba(197, 165, 90, 0.3)',
              borderRadius: '10px',
              padding: '12px 24px',
              fontSize: '14px',
              color: '#E6D5A8',
            }}
          >
            <div>📋</div>
            <div>Copy</div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(45, 212, 168, 0.1)',
              border: '1px solid rgba(45, 212, 168, 0.3)',
              borderRadius: '10px',
              padding: '12px 24px',
              fontSize: '14px',
              color: '#2DD4A8',
            }}
          >
            <div>⚡</div>
            <div>Optimize</div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '10px',
              padding: '12px 24px',
              fontSize: '14px',
              color: '#3B82F6',
            }}
          >
            <div>🔄</div>
            <div>Compare</div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '12px',
            color: 'rgba(235, 213, 167, 0.3)',
          }}
        >
          Created on Prompt Temple
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
