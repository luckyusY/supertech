"use client";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID;

type CredentialResponse = { credential?: string };

type GoogleIdApi = {
  initialize: (config: {
    client_id: string;
    callback: (response: CredentialResponse) => void;
    use_fedcm_for_prompt?: boolean;
  }) => void;
  renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
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

type Props = { nextPath?: string };

export function GoogleSignInButton({ nextPath }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // When no client id is configured we still render a branded, disabled-looking
  // fallback so the layout stays consistent during/after setup.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID || !containerRef.current) return;
    let cancelled = false;
    const container = containerRef.current;

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
        // Hard navigation so the server-rendered header re-reads the new session.
        window.location.assign(nextPath ?? "/");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Google sign-in failed.");
        setLoading(false);
      }
    }

    loadGsi()
      .then(() => {
        const id = window.google?.accounts?.id;
        if (cancelled || !id) return;
        id.initialize({
          client_id: CLIENT_ID as string,
          callback: handleCredential,
          use_fedcm_for_prompt: true,
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
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load Google sign-in.");
      });

    return () => {
      cancelled = true;
    };
  }, [nextPath]);

  if (!CLIENT_ID) return null;

  return (
    <div className="space-y-2">
      <div className="relative flex min-h-[44px] justify-center">
        {/* Google Identity Services renders its official button into this node. */}
        <div ref={containerRef} className="w-full [&>div]:!w-full [&_iframe]:!w-full" />
        {!ready && (
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
