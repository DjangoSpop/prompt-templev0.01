'use client'

import { useState, useEffect } from 'react'
import { getTextDir } from './rtl'

export function useDirectionAwareContent(content: string | undefined, defaultDir: 'ltr' | 'rtl' = 'ltr') {
  const [dir, setDir] = useState<'ltr' | 'rtl'>(defaultDir)

  useEffect(() => {
    if (content) {
      setDir(getTextDir(content))
    } else {
      setDir(defaultDir)
    }
  }, [content, defaultDir])

  return { dir }
}
