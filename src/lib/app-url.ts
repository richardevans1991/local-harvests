/** Server-side app URL for redirects and emails. Prefer APP_URL in production (not baked at build). */
export function getAppUrl() {
  return (
    process.env.APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "http://localhost:3000"
  );
}