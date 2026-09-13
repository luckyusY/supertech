/**
 * Turn a failed `fetch` Response into a message an operator can act on.
 *
 * Admin tools used to collapse every failure into a single generic string,
 * which made a 401, a 403 and a database outage all look identical ("it just
 * doesn't work"). The API replies with `{ error }` for known problems; for
 * anything else — a platform HTML error page, a proxy timeout — we still
 * surface the status code so the failure can be matched against server logs.
 *
 * `action` is an infinitive phrase describing the attempt, e.g.
 * "approve this application".
 */
export async function describeApiFailure(
  response: Response,
  action: string,
): Promise<string> {
  let detail = "";

  try {
    const payload = (await response.json()) as { error?: unknown };
    if (typeof payload.error === "string") {
      detail = payload.error.trim();
    }
  } catch {
    // Body was not JSON — fall through to a status-based message.
  }

  if (!detail) {
    if (response.status === 401) {
      detail = "your session expired, so sign in again";
    } else if (response.status === 403) {
      detail = "this account is not allowed to perform this action";
    } else if (response.status === 404) {
      detail = "the record no longer exists";
    } else if (response.status === 409) {
      detail = "it was already reviewed by someone else";
    } else if (response.status === 503) {
      detail = "the database is not reachable";
    } else {
      detail = "the server returned an unexpected response";
    }
  }

  // Server messages usually end in a period; adding our own would double it.
  const trimmed = detail.replace(/[.\s]+$/, "");

  return `Could not ${action} — ${trimmed}. (HTTP ${response.status})`;
}

/** Message shown when the request never reached the server at all. */
export const NETWORK_FAILURE_MESSAGE =
  "Could not reach the server. Check your connection and try again.";
