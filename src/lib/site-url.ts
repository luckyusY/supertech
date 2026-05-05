const FALLBACK_APP_URL = "http://localhost:3000";

function isLocalUrl(url?: string) {
  return Boolean(url && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(url));
}

export function getAppUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined;
  const vercelPreviewUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;
  const deployedUrl = vercelProductionUrl ?? vercelPreviewUrl;
  const appUrl =
    deployedUrl && isLocalUrl(configuredUrl)
      ? deployedUrl
      : configuredUrl || deployedUrl || FALLBACK_APP_URL;

  return new URL(appUrl);
}

export function getAbsoluteUrl(pathOrUrl: string) {
  return new URL(pathOrUrl, getAppUrl()).toString();
}
