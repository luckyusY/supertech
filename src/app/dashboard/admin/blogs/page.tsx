import type { Metadata } from "next";
import Link from "next/link";
import { FileText, PenLine } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { BlogManagementTable } from "@/components/blog-management-table";
import { getPublishedBlogs } from "@/lib/blogs";
import { hasMongoConfig } from "@/lib/integrations";

export const metadata: Metadata = {
  title: "Manage Blogs - Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminBlogsPage() {
  const blogs = hasMongoConfig() ? await getPublishedBlogs(250).catch(() => []) : [];
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayCount = blogs.filter(
    (blog) => new Date(blog.createdAt).toISOString().slice(0, 10) === todayKey,
  ).length;
  const vendorCount = new Set(blogs.map((blog) => blog.vendorSlug)).size;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <AdminPageHeader
        icon={FileText}
        eyebrow="Content"
        title="Manage Blogs"
        description="Edit published SEO articles, review vendor content, and remove outdated posts."
        actions={
          <Link
            href="/dashboard/admin/products"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-white"
          >
            <PenLine className="h-4 w-4" />
            Write from product
          </Link>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Blogs today", value: todayCount },
          { label: "Total published", value: blogs.length },
          { label: "Vendors with blogs", value: vendorCount },
        ].map((item) => (
          <div key={item.label} className="soft-card p-5">
            <p className="text-sm text-[var(--muted)]">{item.label}</p>
            <p className="mt-1 text-3xl font-semibold tracking-[-0.05em]">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <BlogManagementTable blogs={blogs} showVendor />
      </div>
    </div>
  );
}
