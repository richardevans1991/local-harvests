const PRODUCTION_APP_URL = "https://www.local-harvests.co.uk";

/** Server-side app URL for redirects and emails. Prefer APP_URL in production (not baked at build). */
export function getAppUrl() {
  return (
    process.env.APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "http://localhost:3000"
  );
}

/** Links and images in outbound emails must use a public URL — never localhost. */
export function getEmailAppUrl() {
  const configured =
    process.env.APP_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured && !/localhost|127\.0\.0\.1/i.test(configured)) {
    return configured.replace(/\/$/, "");
  }
  return PRODUCTION_APP_URL;
}