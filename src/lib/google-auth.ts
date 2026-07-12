/**
 * Shared Google OAuth Web client ID resolution.
 * Accepts either GOOGLE_WEB_CLIENT_ID (server) or NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID
 * so a single Vercel env var is enough for One Tap / GIS + token verification.
 */
export function getGoogleWebClientId(): string {
  const id =
    process.env.GOOGLE_WEB_CLIENT_ID?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() ||
    "";
  return id;
}
