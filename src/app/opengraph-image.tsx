import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Prompt Temple — AI Prompt Optimizer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0E1B2A 0%, #1A2F4A 50%, #0E1B2A 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          fontFamily: 'serif',
        }}
      >
        <div style={{ fontSize: 28, color: '#CBA135', marginBottom: 16, letterSpacing: '0.2em' }}>
          ⚡ PROMPT TEMPLE
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: '#FFFFFF',
            marginBottom: 24,
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          AI Prompt Optimizer &{'\n'}Template Library
        </div>
        <div
          style={{
            fontSize: 26,
            color: '#CBA135',
            marginBottom: 40,
            textAlign: 'center',
          }}
        >
          Transform any prompt into a Pharaoh-level masterpiece
        </div>
        <div
          style={{
            display: 'flex',
            gap: '40px',
            fontSize: 20,
            color: '#9CA3AF',
          }}
        >
          <span>✓ 5000+ Templates</span>
          <span>✓ Free to Start</span>
          <span>✓ ChatGPT · Claude · Gemini</span>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 18,
            color: '#4B5563',
          }}
        >
          prompt-temple.com
        </div>
      </div>
    ),
    { ...size }
  );
}
