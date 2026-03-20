/**
 * Smart Template OG Image
 *
 * Dynamic OG image for smart template results.
 */

import { ImageResponse } from 'next/og';
import { NextResponse } from 'next/server';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const templateTitle = searchParams.get('title') || 'Blog Post Generator';
    const category = searchParams.get('category') || 'Content Creation';
    const fieldCount = parseInt(searchParams.get('fields') || '5', 10);

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
              border: '1px solid #3B82F6',
              borderRadius: '20px',
              padding: '8px 20px',
              fontSize: '12px',
              color: '#3B82F6',
              letterSpacing: '1px',
              fontWeight: 600,
              display: 'flex',
            }}
          >
            SMART TEMPLATE
          </div>

          {/* Category Badge */}
          <div
            style={{
              border: '2px solid #9333EA',
              borderRadius: '24px',
              padding: '10px 28px',
              fontSize: '14px',
              color: '#9333EA',
              marginBottom: '32px',
              fontWeight: 600,
              display: 'flex',
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
              display: 'flex',
            }}
          >
            {templateTitle}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '40px', marginBottom: '48px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '48px', fontWeight: 700, color: '#E6D5A8', display: 'flex' }}>
                {fieldCount}
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(235, 213, 167, 0.6)', letterSpacing: '1px', display: 'flex' }}>
                CUSTOMIZABLE FIELDS
              </div>
            </div>
          </div>

          {/* CTA */}
          <div
            style={{
              border: '2px solid rgba(147, 51, 234, 0.5)',
              borderRadius: '14px',
              padding: '16px 36px',
              fontSize: '16px',
              color: '#E6D5A8',
              fontWeight: 600,
              display: 'flex',
            }}
          >
            Use this template on Prompt Temple
          </div>

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              right: '0',
              height: '3px',
              background: 'linear-gradient(90deg, #3B82F6 0%, #9333EA 50%, #3B82F6 100%)',
              display: 'flex',
            }}
          />
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (e) {
    console.error('OG template image failed:', e);
    return NextResponse.json({ error: 'Failed to generate image', details: String(e) }, { status: 500 });
  }
}
