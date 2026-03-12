/**
 * Smart Template OG Image
 *
 * Dynamic OG image for smart template results showing
 * category, filled variables, and generated result.
 */

import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const templateTitle = searchParams.get('title') || 'Blog Post Generator';
  const category = searchParams.get('category') || 'Content Creation';
  const fieldCount = parseInt(searchParams.get('fields') || '5', 10);
  const aiGenerated = searchParams.get('aiGenerated') === 'true';

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
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)',
            border: '1px solid #3B82F6',
            borderRadius: '20px',
            padding: '8px 20px',
            fontSize: '12px',
            color: '#3B82F6',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontWeight: 600,
          }}
        >
          Smart Template
        </div>

        {/* Category Badge */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(147, 51, 234, 0.1) 100%)',
            border: '2px solid #9333EA',
            borderRadius: '24px',
            padding: '10px 28px',
            fontSize: '14px',
            color: '#9333EA',
            marginBottom: '32px',
            fontWeight: 600,
          }}
        >
          {category}
        </div>

        {/* Template Title */}
        <div
          style={{
            fontSize: '44px',
            fontWeight: 700,
            color: '#E6D5A8',
            marginBottom: '24px',
            textAlign: 'center',
            lineHeight: 1.2,
            maxWidth: '900px',
          }}
        >
          {templateTitle}
        </div>

        {/* AI Generated Badge */}
        {aiGenerated && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(45, 212, 168, 0.1)',
              border: '1px solid rgba(45, 212, 168, 0.3)',
              borderRadius: '12px',
              padding: '8px 20px',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                fontSize: '16px',
                filter: 'drop-shadow(0 0 6px rgba(45, 212, 168, 0.4))',
              }}
            >
              ✨
            </div>
            <div
              style={{
                fontSize: '13px',
                color: '#2DD4A8',
                fontWeight: 600,
              }}
            >
              AI-Powered
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div
          style={{
            display: 'flex',
            gap: '40px',
            marginBottom: '48px',
          }}
        >
          {/* Field Count */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                fontSize: '48px',
                fontWeight: 700,
                color: '#E6D5A8',
                marginBottom: '8px',
              }}
            >
              {fieldCount}
            </div>
            <div
              style={{
                fontSize: '13px',
                color: 'rgba(235, 213, 167, 0.6)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Fields Filled
            </div>
          </div>

          {/* Icon */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '48px',
              color: '#9333EA',
            }}
          >
            🎯
          </div>

          {/* Result */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                fontSize: '48px',
                fontWeight: 700,
                color: '#E6D5A8',
                marginBottom: '8px',
              }}
            >
              1
            </div>
            <div
              style={{
                fontSize: '13px',
                color: 'rgba(235, 213, 167, 0.6)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Result Generated
            </div>
          </div>
        </div>

        {/* CTA */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.15) 100%)',
            border: '2px solid rgba(147, 51, 234, 0.5)',
            borderRadius: '14px',
            padding: '16px 36px',
          }}
        >
          <div style={{ fontSize: '20px' }}>🚀</div>
          <div
            style={{
              fontSize: '16px',
              color: '#E6D5A8',
              fontWeight: 600,
            }}
          >
            Use this template on Prompt Temple
          </div>
        </div>

        {/* Features */}
        <div
          style={{
            marginTop: '48px',
            display: 'flex',
            gap: '32px',
            fontSize: '14px',
            color: 'rgba(235, 213, 167, 0.5)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚡</span>
            <span>Instant Fill</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🤖</span>
            <span>AI Suggestions</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📋</span>
            <span>One-Click Use</span>
          </div>
        </div>

        {/* Decorative Elements */}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '3px',
            background: 'linear-gradient(90deg, #3B82F6 0%, #9333EA 50%, #3B82F6 100%)',
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
