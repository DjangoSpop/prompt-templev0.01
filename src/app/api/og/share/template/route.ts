import { ImageResponse } from 'next/og';
import { createElement as h } from 'react';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const templateTitle = searchParams.get('title') || 'Template';
	const category = searchParams.get('category') || 'General';
	const fieldCount = searchParams.get('fields') || '0';

	return new ImageResponse(
		h(
			'div',
			{
				style: {
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					background: 'linear-gradient(135deg, #0E0E10 0%, #1A1A2E 100%)',
					color: '#E6D5A8',
					fontFamily: 'system-ui, sans-serif',
					padding: '40px',
				},
			},
			h(
				'div',
				{
					style: {
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: '12px',
						maxWidth: '1000px',
						textAlign: 'center',
					},
				},
				h('div', { style: { display: 'flex', fontSize: '14px', letterSpacing: '4px', color: 'rgba(230,213,168,0.7)' } }, 'PROMPT TEMPLE'),
				h(
					'div',
					{
						style: {
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							padding: '8px 20px',
							borderRadius: '999px',
							border: '1px solid rgba(59,130,246,0.55)',
							color: '#60A5FA',
							fontSize: '20px',
						},
					},
					category
				),
				h('div', { style: { display: 'flex', fontSize: '58px', fontWeight: 700, lineHeight: 1.1 } }, templateTitle),
				h('div', { style: { display: 'flex', fontSize: '28px', color: 'rgba(230,213,168,0.8)' } }, `${fieldCount} customizable fields`),
				h(
					'div',
					{
						style: {
							marginTop: '10px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							border: '1px solid rgba(147,51,234,0.5)',
							borderRadius: '12px',
							padding: '12px 24px',
							fontSize: '24px',
						},
					},
					'Share and use this template on Prompt Temple'
				)
			)
		),
		{
			width: 1200,
			height: 630,
		}
	);
}
