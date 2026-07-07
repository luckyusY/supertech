import type { Metadata } from "next";
import Link from "next/link";
import { FileText, PenLine } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { BlogManagementTable } from "@/components/blog-management-table";
import { getBlogActivityForVendor, getBlogsForVendor } from "@/lib/blogs";
import { hasMongoConfig } from "@/lib/integrations";
import { loadVendorContext } from "@/lib/vendor-dashboard";

export const metadata: Metadata = {
  title: "Blogs - Vendor",
};

export const dynamic = "force-dynamic";

export default async function VendorBlogsPage() {
  const { currentVendor } = await loadVendorContext("/dashboard/vendor/blogs");
  const [blogs, activity] = hasMongoConfig()
    ? await Promise.all([
        getBlogsForVendor(currentVendor.slug, 100).catch(() => []),
        getBlogActivityForVendor(currentVendor.slug).catch(() => ({
          total: 0,
          today: 0,
          last7Days: 0,
          daily: [],
        })),
      ])
    : [[], { total: 0, today: 0, last7Days: 0, daily: [] }];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <AdminPageHeader
        icon={FileText}
        eyebrow="Content"
        title="Blog management"
        description="Review, edit, and delete the SEO blogs published for your products."
        actions={
          <Link
            href="/dashboard/vendor/ai"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-white"
          >
            <PenLine className="h-4 w-4" />
            Write new blog
          </Link>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Blogs today", value: activity.today },
          { label: "Last 7 days", value: activity.last7Days },
          { label: "Total published", value: activity.total },
        ].map((item) => (
          <div key={item.label} className="soft-card p-5">
            <p className="text-sm text-[var(--muted)]">{item.label}</p>
            <p className="mt-1 text-3xl font-semibold tracking-[-0.05em]">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <BlogManagementTable blogs={blogs} />
      </div>
    </div>
  );
}
