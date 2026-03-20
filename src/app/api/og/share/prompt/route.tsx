/**
 * Prompt Share OG Image
 *
 * Dynamic OG image for shared prompts showing the prompt
 * text and quality score.
 */

import { ImageResponse } from 'next/og';
import { NextResponse } from 'next/server';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const prompt = searchParams.get('prompt') || 'Write a compelling blog post about AI';
    const score = parseFloat(searchParams.get('score') || '8.5');

    const displayPrompt = prompt.length > 150 ? `${prompt.slice(0, 150)}...` : prompt;

    const getScoreColor = (s: number) => {
      if (s >= 8) return '#2DD4A8';
      if (s >= 6) return '#F5C518';
      if (s >= 4) return '#FB923C';
      return '#EF4444';
    };

    const scoreColor = getScoreColor(score);
    const scoreLabel = score >= 8 ? 'Pharaoh Level' : score >= 6 ? 'Expert' : 'Good';

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
              letterSpacing: '1px',
              fontWeight: 600,
              display: 'flex',
            }}
          >
            SHARED PROMPT
          </div>

          {/* Score Circle */}
          <div
            style={{
              width: '160px',
              height: '160px',
              borderRadius: '80px',
              border: `4px solid ${scoreColor}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                fontSize: '56px',
                fontWeight: 700,
                color: scoreColor,
                lineHeight: 1,
                display: 'flex',
              }}
            >
              {score.toFixed(1)}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'rgba(235, 213, 167, 0.6)',
                letterSpacing: '1px',
                display: 'flex',
              }}
            >
              QUALITY SCORE
            </div>
          </div>

          {/* Score Label */}
          <div
            style={{
              fontSize: '14px',
              color: 'rgba(235, 213, 167, 0.5)',
              marginBottom: '40px',
              display: 'flex',
            }}
          >
            {scoreLabel}
          </div>

          {/* Prompt Preview */}
          <div
            style={{
              maxWidth: '800px',
              width: '100%',
              marginBottom: '40px',
              display: 'flex',
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
                display: 'flex',
                width: '100%',
              }}
            >
              {displayPrompt}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              fontSize: '12px',
              color: 'rgba(235, 213, 167, 0.3)',
              display: 'flex',
            }}
          >
            Created on prompt-temple.com
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error('OG prompt image generation failed:', e);
    return NextResponse.json(
      { error: 'Failed to generate image', details: String(e) },
      { status: 500 }
    );
  }
}
