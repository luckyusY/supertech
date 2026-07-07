"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Edit3,
  ExternalLink,
  Loader2,
  Search,
  Trash2,
  X,
} from "lucide-react";
import type { BlogSummary } from "@/lib/blogs";

type BlogManagementTableProps = {
  blogs: BlogSummary[];
  showVendor?: boolean;
};

type EditableFields = {
  title: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  excerpt: string;
  body: string;
  keywords: string;
  hashtags: string;
};

function toEditable(blog: BlogSummary): EditableFields {
  return {
    title: blog.title,
    metaTitle: blog.metaTitle,
    metaDescription: blog.metaDescription,
    slug: blog.slug,
    excerpt: blog.excerpt,
    body: blog.body,
    keywords: blog.keywords.join(", "),
    hashtags: blog.hashtags.join(", "),
  };
}

export function BlogManagementTable({
  blogs: initialBlogs,
  showVendor = false,
}: BlogManagementTableProps) {
  const [blogs, setBlogs] = useState(initialBlogs);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditableFields | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);

  const visibleBlogs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return blogs;
    return blogs.filter((blog) =>
      [
        blog.title,
        blog.productName,
        blog.vendorName,
        blog.category,
        blog.slug,
        ...blog.keywords,
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [blogs, query]);

  function startEdit(blog: BlogSummary) {
    setEditingId(blog.id);
    setDraft(toEditable(blog));
    setError("");
    setSavedId(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(null);
    setError("");
  }

  async function save(blog: BlogSummary) {
    if (!draft) return;
    setBusyId(blog.id);
    setError("");
    setSavedId(null);

    try {
      const response = await fetch(`/api/blog/${blog.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          keywords: draft.keywords,
          hashtags: draft.hashtags,
        }),
      });
      const result = (await response.json()) as { blog?: BlogSummary; error?: string };

      if (!response.ok || result.error || !result.blog) {
        throw new Error(result.error ?? "Unable to save blog.");
      }

      setBlogs((current) =>
        current.map((item) => (item.id === blog.id ? result.blog! : item)),
      );
      setEditingId(null);
      setDraft(null);
      setSavedId(blog.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save blog.");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteBlog(blog: BlogSummary) {
    const confirmed = window.confirm(`Delete "${blog.title}"? This cannot be undone.`);
    if (!confirmed) return;

    setBusyId(blog.id);
    setError("");
    setSavedId(null);

    try {
      const response = await fetch(`/api/blog/${blog.id}`, { method: "DELETE" });
      const result = (await response.json()) as { error?: string };

      if (!response.ok || result.error) {
        throw new Error(result.error ?? "Unable to delete blog.");
      }

      setBlogs((current) => current.filter((item) => item.id !== blog.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete blog.");
    } finally {
      setBusyId(null);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/25";

  return (
    <section className="soft-card overflow-hidden">
      <div className="border-b border-[var(--line)] p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-[-0.04em]">Published blogs</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Edit SEO fields, update article content, or remove old posts.
            </p>
          </div>
          <label className="relative block w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search blogs"
              className="h-10 w-full rounded-lg border border-[var(--line)] bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/25"
            />
          </label>
        </div>
        {error ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        ) : null}
      </div>

      {visibleBlogs.length === 0 ? (
        <div className="p-8 text-center text-sm text-[var(--muted)]">
          No blogs match this view yet.
        </div>
      ) : (
        <div className="divide-y divide-[var(--line)]">
          {visibleBlogs.map((blog) => {
            const editing = editingId === blog.id && draft;
            const busy = busyId === blog.id;
            return (
              <article key={blog.id} className="p-4 sm:p-5">
                <div className="grid gap-4 lg:grid-cols-[5rem_minmax(0,1fr)_auto] lg:items-start">
                  <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-[#f7f7f7]">
                    <Image
                      src={blog.heroImage}
                      alt={blog.productName}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  <div className="min-w-0">
                    {editing ? (
                      <div className="grid gap-3">
                        <label className="grid gap-1.5 text-sm font-semibold">
                          Title
                          <input
                            value={draft.title}
                            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                            className={inputClass}
                          />
                        </label>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="grid gap-1.5 text-sm font-semibold">
                            Slug
                            <input
                              value={draft.slug}
                              onChange={(event) => setDraft({ ...draft, slug: event.target.value })}
                              className={inputClass}
                            />
                          </label>
                          <label className="grid gap-1.5 text-sm font-semibold">
                            Meta title
                            <input
                              value={draft.metaTitle}
                              onChange={(event) =>
                                setDraft({ ...draft, metaTitle: event.target.value })
                              }
                              className={inputClass}
                            />
                          </label>
                        </div>
                        <label className="grid gap-1.5 text-sm font-semibold">
                          Meta description
                          <textarea
                            value={draft.metaDescription}
                            onChange={(event) =>
                              setDraft({ ...draft, metaDescription: event.target.value })
                            }
                            rows={2}
                            className={`${inputClass} resize-none`}
                          />
                        </label>
                        <label className="grid gap-1.5 text-sm font-semibold">
                          Excerpt
                          <textarea
                            value={draft.excerpt}
                            onChange={(event) =>
                              setDraft({ ...draft, excerpt: event.target.value })
                            }
                            rows={2}
                            className={`${inputClass} resize-none`}
                          />
                        </label>
                        <label className="grid gap-1.5 text-sm font-semibold">
                          Article body
                          <textarea
                            value={draft.body}
                            onChange={(event) => setDraft({ ...draft, body: event.target.value })}
                            rows={9}
                            className={`${inputClass} font-mono text-xs leading-6`}
                          />
                        </label>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="grid gap-1.5 text-sm font-semibold">
                            Keywords
                            <input
                              value={draft.keywords}
                              onChange={(event) =>
                                setDraft({ ...draft, keywords: event.target.value })
                              }
                              className={inputClass}
                            />
                          </label>
                          <label className="grid gap-1.5 text-sm font-semibold">
                            Hashtags
                            <input
                              value={draft.hashtags}
                              onChange={(event) =>
                                setDraft({ ...draft, hashtags: event.target.value })
                              }
                              className={inputClass}
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--accent)]">
                            {blog.category}
                          </span>
                          {showVendor ? (
                            <span className="rounded-full bg-[rgba(15,23,42,0.06)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                              {blog.vendorName}
                            </span>
                          ) : null}
                          {savedId === blog.id ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#166534]">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Saved
                            </span>
                          ) : null}
                        </div>
                        <h3 className="mt-2 line-clamp-2 text-lg font-semibold tracking-[-0.03em]">
                          {blog.title}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
                          {blog.excerpt || blog.metaDescription}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--muted)]">
                          <span>{blog.productName}</span>
                          <span>{new Date(blog.createdAt).toLocaleDateString("en-US")}</span>
                          <span>{blog.keywords.length} keywords</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    {editing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => void save(blog)}
                          disabled={busy}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-3 text-xs font-bold text-white disabled:opacity-60"
                        >
                          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[var(--line)] px-3 text-xs font-semibold"
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href={`/blog/${blog.slug}`}
                          target="_blank"
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[var(--line)] px-3 text-xs font-semibold"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => startEdit(blog)}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[var(--line)] px-3 text-xs font-semibold"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteBlog(blog)}
                          disabled={busy}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-600 disabled:opacity-60"
                        >
                          {busy ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
