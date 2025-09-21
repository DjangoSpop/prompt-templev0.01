import { useLocale } from '@/providers/LocaleProvider'

export function LocaleSwitcher() {
  const { locale, setLocale } = useLocale()

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLocale('en')}
        className={`px-2 py-1 rounded ${
          locale === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200'
        }`}
      >
        English
      </button>
      <button
        onClick={() => setLocale('ar')}
        className={`px-2 py-1 rounded ${
          locale === 'ar' ? 'bg-blue-500 text-white' : 'bg-gray-200'
        } font-arabic`}
      >
        العربية
      </button>
    </div>
  )
}
