import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { setCookie, getCookie } from 'cookies-next'

interface LocaleContextType {
  locale: string
  setLocale: (locale: string) => void
  dir: 'ltr' | 'rtl'
  t: (key: string, namespace?: string) => string
}

const LocaleContext = createContext<LocaleContextType>({
  locale: 'en',
  setLocale: () => {},
  dir: 'ltr',
  t: () => '',
})

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [translations, setTranslations] = useState<Record<string, any>>({})
  const [locale, setLocaleState] = useState(getCookie('NEXT_LOCALE') as string || 'en')
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  useEffect(() => {
    // Load translations
    const loadTranslations = async () => {
      try {
        const commonTranslations = await fetch(`/locales/${locale}/common.json`).then(res => res.json())
        setTranslations(commonTranslations)
      } catch (error) {
        console.error('Failed to load translations:', error)
      }
    }
    loadTranslations()
  }, [locale])

  const setLocale = (newLocale: string) => {
    setLocaleState(newLocale)
    setCookie('NEXT_LOCALE', newLocale)
    document.documentElement.lang = newLocale
    document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr'
    router.push(router.pathname, router.asPath, { locale: newLocale })
  }

  const t = (key: string, namespace = 'common') => {
    const keys = key.split('.')
    let current = translations

    for (const k of keys) {
      if (current[k] === undefined) {
        console.warn(`Translation key not found: ${key}`)
        return key
      }
      current = current[k]
    }

    return current
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, dir, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

export const useLocale = () => useContext(LocaleContext)
