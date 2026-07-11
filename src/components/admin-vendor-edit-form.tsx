"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { toast } from "sonner";
import {
  updateAdminVendorAction,
  type AdminVendorUpdateInput,
} from "@/app/dashboard/admin/vendors/actions";
import { Button } from "@/components/ui";
import type { AdminVendorRecord } from "@/lib/public-marketplace";

const fieldClass =
  "mt-1.5 w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15";

export function AdminVendorEditForm({ vendor }: { vendor: AdminVendorRecord }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<AdminVendorUpdateInput>({
    name: vendor.name,
    headline: vendor.headline ?? "",
    location: vendor.location ?? "",
    whatsappNumber: vendor.whatsappNumber ?? "",
    categories: (vendor.categories ?? []).join(", "),
    responseTime: vendor.responseTime ?? "",
    coverImage: vendor.coverImage ?? "",
    logoMark: vendor.logoMark ?? "",
    accent: vendor.accent ?? "#102019",
    momoMerchantCode: vendor.momoMerchantCode ?? "",
    momoBusinessName: vendor.momoBusinessName ?? "",
  });

  function setField<K extends keyof AdminVendorUpdateInput>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      try {
        await updateAdminVendorAction(vendor.slug, form);
        toast.success("Vendor updated", {
          description: vendor.isSeed
            ? "Override saved for built-in vendor."
            : "Profile saved.",
        });
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to save vendor.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="soft-card p-5 sm:p-6">
        <h2 className="text-subtitle text-[var(--foreground)]">Profile</h2>
        <p className="mt-1 text-caption text-[var(--muted)]">
          Public storefront identity and contact details.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-label text-[var(--muted)]">
            Business name
            <input
              required
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block text-label text-[var(--muted)]">
            Location
            <input
              value={form.location}
              onChange={(e) => setField("location", e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block text-label text-[var(--muted)] sm:col-span-2">
            Headline
            <input
              value={form.headline}
              onChange={(e) => setField("headline", e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block text-label text-[var(--muted)]">
            WhatsApp number
            <input
              value={form.whatsappNumber}
              onChange={(e) => setField("whatsappNumber", e.target.value)}
              className={fieldClass}
              placeholder="+250…"
            />
          </label>
          <label className="block text-label text-[var(--muted)]">
            Response time
            <input
              value={form.responseTime}
              onChange={(e) => setField("responseTime", e.target.value)}
              className={fieldClass}
              placeholder="Within 24 hours"
            />
          </label>
          <label className="block text-label text-[var(--muted)] sm:col-span-2">
            Categories (comma-separated)
            <input
              value={form.categories}
              onChange={(e) => setField("categories", e.target.value)}
              className={fieldClass}
              placeholder="Mobile Essentials, Audio"
            />
          </label>
        </div>
      </section>

      <section className="soft-card p-5 sm:p-6">
        <h2 className="text-subtitle text-[var(--foreground)]">Media & brand</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-label text-[var(--muted)] sm:col-span-2">
            Cover image URL
            <input
              value={form.coverImage}
              onChange={(e) => setField("coverImage", e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block text-label text-[var(--muted)]">
            Logo mark (1–3 chars)
            <input
              value={form.logoMark}
              onChange={(e) => setField("logoMark", e.target.value)}
              className={fieldClass}
              maxLength={3}
            />
          </label>
          <label className="block text-label text-[var(--muted)]">
            Accent color
            <div className="mt-1.5 flex items-center gap-2">
              <input
                type="color"
                value={form.accent || "#102019"}
                onChange={(e) => setField("accent", e.target.value)}
                className="h-10 w-12 cursor-pointer rounded border border-[var(--line)] bg-white p-1"
              />
              <input
                value={form.accent}
                onChange={(e) => setField("accent", e.target.value)}
                className={fieldClass + " !mt-0"}
              />
            </div>
          </label>
        </div>
      </section>

      <section className="soft-card p-5 sm:p-6">
        <h2 className="text-subtitle text-[var(--foreground)]">MoMoPay</h2>
        <p className="mt-1 text-caption text-[var(--muted)]">
          Admin can override merchant details for this seller.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-label text-[var(--muted)]">
            Merchant code
            <input
              value={form.momoMerchantCode}
              onChange={(e) => setField("momoMerchantCode", e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block text-label text-[var(--muted)]">
            Business name on MoMo
            <input
              value={form.momoBusinessName}
              onChange={(e) => setField("momoBusinessName", e.target.value)}
              className={fieldClass}
            />
          </label>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="primary" disabled={pending}>
          <Save className="h-4 w-4" />
          {pending ? "Saving…" : "Save changes"}
        </Button>
        {vendor.isSeed ? (
          <p className="text-caption text-[var(--muted)]">
            Built-in vendor — edits store as an override in MongoDB.
          </p>
        ) : null}
      </div>
    </form>
  );
}
