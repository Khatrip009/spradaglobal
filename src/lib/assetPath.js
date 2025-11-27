// src/lib/assetPath.js
// Returns a correct runtime URL for static files placed in Vite's /public folder
// Works with project subpath builds (GitHub Pages -> /spradaglobal/)
export function assetPath(p) {
  if (!p) return p || '';
  // Ensure no leading slash duplication
  const clean = String(p).replace(/^\/+/, '');
  // import.meta.env.BASE_URL ends with '/' by Vite, so just concat
  return `${import.meta.env.BASE_URL || '/'}${clean}`;
}
