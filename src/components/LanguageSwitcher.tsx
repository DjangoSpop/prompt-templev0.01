import { useState, useCallback } from 'react'
import { useLocale } from '@/providers/LocaleProvider'
import { LanguagesIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'
import { motion, AnimatePresence } from 'framer-motion'

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' }
]

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLocale()
  const [isOpen, setIsOpen] = useState(false)

  const handleLanguageChange = useCallback((newLocale: string) => {
    setLocale(newLocale)
    setIsOpen(false)
  }, [setLocale])

  const currentLanguage = languages.find(lang => lang.code === locale)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip content={t('tooltips.languageSwitch')}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`w-9 px-0 ${className}`}
          >
            <span className="sr-only">Switch language</span>
            <AnimatePresence mode="wait">
              <motion.div
                key={locale}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center"
              >
                {currentLanguage?.flag}
              </motion.div>
            </AnimatePresence>
          </Button>
        </DropdownMenuTrigger>
      </Tooltip>

      <DropdownMenuContent align="end" className="w-[150px] rtl:origin-top-left" sideOffset={8}>
        <AnimatePresence mode="wait">
          {languages.map((language) => (
            <motion.div
              key={language.code}
              initial={{ opacity: 0, x: locale === 'ar' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: locale === 'ar' ? -20 : 20 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              <DropdownMenuItem
                onClick={() => handleLanguageChange(language.code)}
                className={`flex items-center justify-between rtl:flex-row-reverse ${
                  locale === language.code ? 'bg-accent' : ''
                }`}
                dir={language.dir}
              >
                <span className="flex items-center gap-2 rtl:flex-row-reverse">
                  <span>{language.flag}</span>
                  <span>{language.name}</span>
                </span>
                {locale === language.code && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 rounded-full bg-primary"
                    transition={{ delay: 0.1 }}
                  />
                )}
              </DropdownMenuItem>
            </motion.div>
          ))}
        </AnimatePresence>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
