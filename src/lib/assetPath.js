// src/lib/assetPath.js
export function assetPath(p) {
  if (!p) return "";

  // Ensure string and remove any leading slashes
  const clean = String(p).replace(/^\/+/, "");

  // Vite guarantees BASE_URL ends with a slash
  const base = import.meta.env.BASE_URL || "/";

  return `${base}${clean}`;
}
