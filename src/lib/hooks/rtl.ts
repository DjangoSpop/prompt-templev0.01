type Direction = 'ltr' | 'rtl';

/**
 * Detects if a string contains RTL characters
 */
const hasRTLCharacters = (text: string): boolean => {
  const rtlRegex = /[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/;
  return rtlRegex.test(text);
};

/**
 * Gets the text direction based on content
 * - If text contains RTL characters, returns 'rtl'
 * - Otherwise returns 'ltr'
 */
export const getTextDir = (text: string | undefined): Direction => {
  if (!text) return 'ltr';
  
  // Check for explicit direction markers
  if (text.startsWith('\u200E')) return 'ltr'; // LTR mark
  if (text.startsWith('\u200F')) return 'rtl'; // RTL mark
  
  // Check content for RTL characters
  return hasRTLCharacters(text) ? 'rtl' : 'ltr';
};

/**
 * Adds direction marker to text based on its content
 */
export const addDirectionMarker = (text: string): string => {
  const dir = getTextDir(text);
  const marker = dir === 'rtl' ? '\u200F' : '\u200E';
  return marker + text;
};

/**
 * Gets bidi isolation characters for embedding RTL text in LTR context
 * or vice versa
 */
export const getBidiIsolation = (text: string | undefined): { start: string; end: string } => {
  if (!text) return { start: '', end: '' };
  
  const dir = getTextDir(text);
  return dir === 'rtl' 
    ? { start: '\u2067', end: '\u2069' } // RTL isolation
    : { start: '\u2066', end: '\u2069' }; // LTR isolation
};
