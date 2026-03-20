import { ImageResponse } from 'next/og';

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
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 28, color: '#CBA135', marginBottom: 16, letterSpacing: '0.2em', display: 'flex' }}>
          PROMPT TEMPLE
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: '#FFFFFF',
            marginBottom: 24,
            textAlign: 'center',
            lineHeight: 1.2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex' }}>AI Prompt Optimizer</div>
          <div style={{ display: 'flex' }}>Template Library</div>
        </div>
        <div
          style={{
            fontSize: 26,
            color: '#CBA135',
            marginBottom: 40,
            textAlign: 'center',
            display: 'flex',
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
          <div style={{ display: 'flex' }}>5000+ Templates</div>
          <div style={{ display: 'flex' }}>Free to Start</div>
          <div style={{ display: 'flex' }}>ChatGPT / Claude / Gemini</div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 18,
            color: '#4B5563',
            display: 'flex',
          }}
        >
          prompt-temple.com
        </div>
      </div>
    ),
    { ...size }
  );
}
