import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/profile/',
          '/settings/',
          '/auth/login',
        ],
      },
    ],
    sitemap: 'https://prompt-temple.com/sitemap.xml',
  };
}
