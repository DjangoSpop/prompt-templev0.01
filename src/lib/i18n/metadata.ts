import { Metadata } from 'next'

type MetadataParams = {
  title: {
    en: string
    ar: string
  }
  description: {
    en: string
    ar: string
  }
  path: string
}

export function generateMetadata({ title, description, path }: MetadataParams): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  const metadata: Metadata = {
    title: {
      template: '%s | Prompt Temple',
      default: title.en,
      absolute: `${title.en} | Prompt Temple`,
    },
    description: description.en,
    alternates: {
      canonical: `${baseUrl}${path}`,
      languages: {
        'en': `${baseUrl}/en${path}`,
        'ar': `${baseUrl}/ar${path}`,
      },
    },
    openGraph: {
      title: title.en,
      description: description.en,
      url: `${baseUrl}${path}`,
      siteName: 'Prompt Temple',
      locale: 'en',
      alternateLocale: 'ar',
    },
  }

  return metadata
}
