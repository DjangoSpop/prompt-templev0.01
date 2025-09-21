export function formatDate(date: Date | string | number, locale: string, options?: Intl.DateTimeFormatOptions) {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }
  
  return new Intl.DateTimeFormat(locale, defaultOptions).format(new Date(date))
}

export function formatNumber(number: number, locale: string, options?: Intl.NumberFormatOptions) {
  const defaultOptions: Intl.NumberFormatOptions = {
    maximumFractionDigits: 2,
    ...options,
  }
  
  return new Intl.NumberFormat(locale, defaultOptions).format(number)
}

export function formatCurrency(amount: number, locale: string, currency: string = 'USD') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}

export function getPlural(count: number, locale: string, options: { one: string; other: string; zero?: string }) {
  const rules = new Intl.PluralRules(locale)
  const rule = rules.select(count)
  
  if (rule === 'zero' && options.zero) {
    return options.zero
  }
  
  return rule === 'one' ? options.one : options.other
}
