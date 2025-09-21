import { useEffect, useState } from 'react'

export function useTextDirection(text: string | undefined) {
  const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr')

  useEffect(() => {
    if (!text) return

    // Check if the text contains RTL characters
    const rtlRegex = /[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/
    setDir(rtlRegex.test(text) ? 'rtl' : 'ltr')
  }, [text])

  return dir
}
