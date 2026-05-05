const FALLBACK_APP_URL = "http://localhost:3000";

export function getAppUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined) ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

  return new URL(configuredUrl ?? FALLBACK_APP_URL);
}

export function getAbsoluteUrl(pathOrUrl: string) {
  return new URL(pathOrUrl, getAppUrl()).toString();
}
