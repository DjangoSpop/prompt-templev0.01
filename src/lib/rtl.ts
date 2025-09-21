// Utility to detect RTL text
export function isRTLText(text: string): boolean {
  const rtlRegex = /[\u0591-\u07FF]/; // Hebrew and Arabic character ranges
  return rtlRegex.test(text);
}

// Utility to get text direction
export function getTextDir(text: string): 'rtl' | 'ltr' {
  return isRTLText(text) ? 'rtl' : 'ltr';
}
