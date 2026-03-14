/**
 * Broadcast Comparison OG Image
 *
 * Dynamic OG image for Multi-AI Broadcast comparison results.
 * This is the flagship shareable feature.
 */

import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const prompt = searchParams.get('prompt') || 'Test this prompt across AI models';
  const bestModel = searchParams.get('bestModel') || 'Claude 3';
  const providerCount = parseInt(searchParams.get('providers') || '4', 10);
  const providerNames = searchParams.get('providerNames')?.split(',') || [
    'OpenAI',
    'Anthropic',
    'Google',
    'Meta',
  ];

  // Truncate prompt if too long
  const displayPrompt = prompt.length > 80 ? `${prompt.slice(0, 80)}...` : prompt;

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
            marginBottom: '16px',
            letterSpacing: '4px',
            textTransform: 'uppercase',
          }}
        >
          AI Model Comparison
        </div>

        <div
          style={{
            fontSize: '52px',
            fontWeight: 700,
            color: '#E6D5A8',
            marginBottom: '16px',
            textAlign: 'center',
            lineHeight: 1.1,
          }}
        >
          Which AI Model
          <br />
          Performs Best?
        </div>

        <div
          style={{
            fontSize: '18px',
            color: 'rgba(235, 213, 167, 0.6)',
            marginBottom: '48px',
          }}
        >
          Tested across {providerCount} models
        </div>

        {/* Best Model Badge */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'linear-gradient(135deg, rgba(45, 212, 168, 0.2) 0%, rgba(45, 212, 168, 0.05) 100%)',
            border: '3px solid #2DD4A8',
            borderRadius: '16px',
            padding: '28px 56px',
            marginBottom: '48px',
            boxShadow: '0 20px 40px rgba(45, 212, 168, 0.15)',
          }}
        >
          <div
            style={{
              fontSize: '14px',
              color: '#2DD4A8',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontWeight: 600,
            }}
          >
            Best Overall
          </div>
          <div
            style={{
              fontSize: '36px',
              fontWeight: 800,
              color: '#E6D5A8',
              marginBottom: '8px',
            }}
          >
            {bestModel}
          </div>
          <div
            style={{
              fontSize: '14px',
              color: 'rgba(235, 213, 167, 0.5)',
            }}
          >
            Based on quality and speed
          </div>
        </div>

        {/* Provider Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(providerCount, 4)}, 1fr)`,
            gap: '16px',
            maxWidth: '900px',
            width: '100%',
          }}
        >
          {providerNames.slice(0, 4).map((provider, i) => (
            <div
              key={provider}
              style={{
                background:
                  provider === bestModel
                    ? 'rgba(45, 212, 168, 0.1)'
                    : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${
                  provider === bestModel ? '#2DD4A8' : 'rgba(255, 255, 255, 0.1)'
                }`,
                borderRadius: '10px',
                padding: '16px',
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#E6D5A8',
                  marginBottom: '4px',
                }}
              >
                {provider}
              </div>
              {provider === bestModel && (
                <div
                  style={{
                    fontSize: '11px',
                    color: '#2DD4A8',
                    fontWeight: 600,
                  }}
                >
                  ⭐ Winner
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Prompt Preview */}
        <div
          style={{
            marginTop: '48px',
            maxWidth: '800px',
            width: '100%',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              color: 'rgba(235, 213, 167, 0.5)',
              marginBottom: '12px',
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            The Prompt
          </div>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              padding: '20px 32px',
              fontSize: '15px',
              color: '#E6D5A8',
              textAlign: 'center',
              lineHeight: 1.6,
              fontStyle: 'italic',
            }}
          >
            "{displayPrompt}"
          </div>
        </div>

        {/* CTA */}
        <div
          style={{
            marginTop: '48px',
            fontSize: '14px',
            color: 'rgba(235, 213, 167, 0.4)',
            letterSpacing: '1px',
          }}
        >
          Compare models on Prompt Temple
        </div>

        {/* Decorative Elements */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '20px',
            width: '2px',
            height: '100px',
            background: 'linear-gradient(180deg, transparent, rgba(197, 165, 90, 0.3), transparent)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            right: '20px',
            width: '2px',
            height: '100px',
            background: 'linear-gradient(180deg, transparent, rgba(197, 165, 90, 0.3), transparent)',
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
