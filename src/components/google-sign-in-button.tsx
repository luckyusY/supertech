"use client";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

type CredentialResponse = { credential?: string };

type GoogleIdApi = {
  initialize: (config: {
    client_id: string;
    callback: (response: CredentialResponse) => void;
    use_fedcm_for_prompt?: boolean;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    context?: string;
  }) => void;
  renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
  prompt?: () => void;
};

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleIdApi } };
  }
}

let gsiPromise: Promise<void> | null = null;

function loadGsi(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.google?.accounts?.id) return Promise.resolve();
  if (gsiPromise) return gsiPromise;
  gsiPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google sign-in."));
    document.head.appendChild(script);
  });
  return gsiPromise;
}

async function resolveClientId(prop?: string): Promise<string> {
  const fromProp = prop?.trim();
  if (fromProp) return fromProp;
  const fromEnv = process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
  if (fromEnv) return fromEnv;
  // Runtime: GOOGLE_WEB_CLIENT_ID on the server (works without NEXT_PUBLIC rebuild)
  try {
    const res = await fetch("/api/auth/google/config", { cache: "no-store" });
    const data = (await res.json()) as { clientId?: string | null };
    return data.clientId?.trim() || "";
  } catch {
    return "";
  }
}

type Props = {
  nextPath?: string;
  clientId?: string;
  enableOneTap?: boolean;
};

export function GoogleSignInButton({
  nextPath,
  clientId: clientIdProp,
  enableOneTap = true,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [missingConfig, setMissingConfig] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    async function handleCredential(response: CredentialResponse) {
      if (!response.credential) {
        setError("Google did not return a credential. Please try again.");
        return;
      }
      setError("");
      setLoading(true);
      try {
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: response.credential }),
        });
        const payload = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(payload.error ?? "Google sign-in failed.");
        window.location.assign(nextPath ?? "/");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Google sign-in failed.");
        setLoading(false);
      }
    }

    (async () => {
      const CLIENT_ID = await resolveClientId(clientIdProp);
      if (cancelled) return;
      if (!CLIENT_ID) {
        setMissingConfig(true);
        return;
      }
      try {
        await loadGsi();
        const id = window.google?.accounts?.id;
        if (cancelled || !id || !container) return;
        id.initialize({
          client_id: CLIENT_ID,
          callback: handleCredential,
          use_fedcm_for_prompt: true,
          auto_select: true,
          cancel_on_tap_outside: true,
          context: "signin",
        });
        const width = Math.min(Math.round(container.clientWidth) || 360, 400);
        id.renderButton(container, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          logo_alignment: "center",
          width,
        });
        if (!cancelled) setReady(true);
        if (enableOneTap && typeof id.prompt === "function") {
          try {
            id.prompt();
          } catch {
            // One Tap can be blocked by browser; button still works
          }
        }
      } catch {
        if (!cancelled) setError("Couldn't load Google sign-in.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [nextPath, clientIdProp, enableOneTap]);

  if (missingConfig) {
    return (
      <p className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--page)] px-3 py-3 text-center text-xs text-[var(--muted)]">
        Google sign-in needs{" "}
        <code className="font-mono text-[11px]">GOOGLE_WEB_CLIENT_ID</code> in
        Vercel env (your Web client ID), then{" "}
        <strong>redeploy</strong>. Optional: also set{" "}
        <code className="font-mono text-[11px]">NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID</code>{" "}
        to the same value.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative flex min-h-[44px] justify-center">
        <div ref={containerRef} className="w-full [&>div]:!w-full [&_iframe]:!w-full" />
        {!ready && !error && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white text-sm font-semibold text-[var(--muted)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading Google…
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white/90 text-sm font-semibold text-[var(--foreground)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in…
          </div>
        )}
      </div>
      {error && (
        <p className="text-center text-xs text-[var(--red)]">{error}</p>
      )}
    </div>
  );
}

/** Alias used by forms; same component. */
export { GoogleSignInButton as GoogleSignIn };
