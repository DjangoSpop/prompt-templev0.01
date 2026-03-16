/**
 * OG Image Generation for Certificate Sharing
 *
 * Generates a 1200x630 social preview image using Next.js ImageResponse.
 * Used when sharing certificates on LinkedIn, Twitter, etc.
 */

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') || 'Learner';
  const course = searchParams.get('course') || 'Prompt Engineering Mastery';
  const code = searchParams.get('code') || '';

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
          fontFamily: 'serif',
          position: 'relative',
        }}
      >
        {/* Gold Border */}
        <div
          style={{
            position: 'absolute',
            inset: '12px',
            border: '2px solid rgba(197, 165, 90, 0.4)',
            borderRadius: '8px',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '20px',
            border: '1px solid rgba(197, 165, 90, 0.2)',
            borderRadius: '4px',
            display: 'flex',
          }}
        />

        {/* Academy Name */}
        <div
          style={{
            fontSize: '16px',
            color: 'rgba(197, 165, 90, 0.7)',
            letterSpacing: '6px',
            textTransform: 'uppercase',
            marginBottom: '12px',
            display: 'flex',
          }}
        >
          PROMPT TEMPLE ACADEMY
        </div>

        {/* Divider */}
        <div
          style={{
            width: '120px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(197, 165, 90, 0.5), transparent)',
            marginBottom: '16px',
            display: 'flex',
          }}
        />

        {/* Certificate of Completion */}
        <div
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#C5A55A',
            marginBottom: '8px',
            display: 'flex',
          }}
        >
          Certificate of Completion
        </div>

        <div
          style={{
            fontSize: '14px',
            color: 'rgba(235, 213, 167, 0.6)',
            marginBottom: '24px',
            display: 'flex',
          }}
        >
          This is to certify that
        </div>

        {/* Learner Name */}
        <div
          style={{
            fontSize: '48px',
            fontWeight: 700,
            color: '#E6D5A8',
            marginBottom: '12px',
            display: 'flex',
          }}
        >
          {name}
        </div>

        <div
          style={{
            fontSize: '14px',
            color: 'rgba(235, 213, 167, 0.6)',
            marginBottom: '12px',
            display: 'flex',
          }}
        >
          has successfully completed
        </div>

        {/* Course Name */}
        <div
          style={{
            fontSize: '24px',
            fontWeight: 600,
            color: '#2DD4A8',
            marginBottom: '32px',
            display: 'flex',
          }}
        >
          {course}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            fontSize: '12px',
            color: 'rgba(235, 213, 167, 0.5)',
          }}
        >
          {code && (
            <div style={{ display: 'flex', gap: '4px' }}>
              <span>Verify:</span>
              <span style={{ color: '#C5A55A', fontFamily: 'monospace' }}>{code}</span>
            </div>
          )}
          <div style={{ display: 'flex' }}>prompt-temple.com/academy</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
