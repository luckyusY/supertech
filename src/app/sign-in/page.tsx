import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { SignInForm } from "@/components/sign-in-form";
import { getAuthSetupState } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Access the SuperTech admin and vendor workspaces.",
};

type SignInPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const resolvedSearchParams = await searchParams;
  const setupState = getAuthSetupState();
  const nextPath =
    typeof resolvedSearchParams.next === "string" ? resolvedSearchParams.next : undefined;

  return (
    <div className="page-shell py-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_420px]">
        <section className="dark-card p-6 sm:p-8 lg:p-10">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-[rgba(255,255,255,0.78)]">
            <ShieldCheck className="h-4 w-4" />
            Access control
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
            Sign in to the admin or vendor workspace.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[rgba(255,255,255,0.76)]">
            The storefront stays public, but seller publishing, Cloudinary upload
            signing, and order operations now require an authenticated role.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                label: "Admin",
                description: "Approvals, manual orders, and marketplace control room access.",
              },
              {
                label: "Vendor",
                description: "Product submissions, seller queue, and vendor-scoped operations.",
              },
              {
                label: "Customer",
                description: "Reserved for later order history and account-based tracking.",
              },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-[1.35rem] border border-white/10 bg-white/6 p-4"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/72">
                  {card.label}
                </p>
                <p className="mt-3 text-sm leading-7 text-[rgba(255,255,255,0.7)]">
                  {card.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/6 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/72">
              Environment setup
            </p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-[rgba(255,255,255,0.72)]">
              <p>
                Add <code>AUTH_SECRET</code> and <code>AUTH_DEMO_USERS_JSON</code> in
                Vercel before using sign-in on production.
              </p>
              <p>
                This is a practical signed-session bridge for the MVP. It keeps the
                dashboards protected now, and we can swap in Clerk/Auth0 later
                without reworking the whole marketplace.
              </p>
            </div>
          </div>
        </section>

        <section className="soft-card p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Workspace sign-in
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
            Continue into the protected areas
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            Use one of your configured accounts to access the correct dashboard for
            that role.
          </p>

          <div className="mt-6">
            <SignInForm ready={setupState.ready} nextPath={nextPath} />
          </div>

          {!setupState.ready ? (
            <div className="mt-6 rounded-[1.15rem] border border-[rgba(228,90,54,0.2)] bg-[rgba(228,90,54,0.06)] p-4 text-sm leading-7 text-[var(--muted)]">
              Add the auth environment variables first. The form stays disabled until
              runtime secrets and at least one user account are available.
            </div>
          ) : null}

          {setupState.previewProfiles.length > 0 ? (
            <div className="mt-6 space-y-3">
              <p className="text-sm font-semibold">
                {setupState.usingDevFallbackUsers
                  ? "Local dev fallback accounts"
                  : "Configured account preview"}
              </p>
              {setupState.previewProfiles.map((profile) => (
                <div
                  key={`${profile.role}-${profile.email}`}
                  className="rounded-[1.15rem] border border-[var(--line)] bg-white/72 p-4 text-sm"
                >
                  <p className="font-semibold">{profile.name}</p>
                  <p className="mt-1 text-[var(--muted)]">{profile.email}</p>
                  <p className="mt-1 text-[var(--muted)]">
                    Role: {profile.role}
                    {profile.vendorSlug ? ` | Vendor: ${profile.vendorSlug}` : ""}
                  </p>
                  {profile.password ? (
                    <p className="mt-1 text-[var(--muted)]">Password: {profile.password}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
