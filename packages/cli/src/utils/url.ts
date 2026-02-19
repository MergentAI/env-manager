export const normalizeBaseUrl = (url: string): string => {
  let cleaned = url.trim();

  // Ensure protocol
  if (!/^https?:\/\//.test(cleaned)) {
    cleaned = `http://${cleaned}`;
  }

  // Remove trailing slashes
  cleaned = cleaned.replace(/\/+$/, "");

  // Remove trailing '/api' if present (to ensure we have the base)
  // This allows users to input 'localhost:3000/api' or just 'localhost:3000'
  if (cleaned.endsWith("/api")) {
    cleaned = cleaned.slice(0, -4);
  }

  return cleaned;
};
