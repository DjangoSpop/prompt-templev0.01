// Utility to safely join base and path and ensure trailing slash when desired
export function joinApiPath(base: string, path: string, ensureTrailing = false) {
  if (!base) base = '';
  if (!path) path = '';

  // Remove duplicate slashes
  const combined = `${base.replace(/\/+$/,'')}/${path.replace(/^\/+/, '')}`;
  if (ensureTrailing) {
    return combined.endsWith('/') ? combined : `${combined}/`;
  }
  return combined;
}
