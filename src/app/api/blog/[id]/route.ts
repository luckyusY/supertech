import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { authorizeRequest } from "@/lib/auth";
import { deleteBlogById, getBlogById, updateBlogById } from "@/lib/blogs";
import { hasMongoConfig } from "@/lib/integrations";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type BlogUpdateBody = {
  title?: string;
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
  excerpt?: string;
  body?: string;
  keywords?: unknown;
  hashtags?: unknown;
};

function toList(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => String(item));
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return undefined;
}

async function requireManageableBlog(request: Request, id: string) {
  const auth = authorizeRequest(request, ["admin", "vendor"]);
  if (!auth.ok) return { ok: false as const, response: auth.response };

  if (!hasMongoConfig()) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Blog management requires the database to be configured." },
        { status: 503 },
      ),
    };
  }

  const blog = await getBlogById(id);
  if (!blog) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Blog not found." }, { status: 404 }),
    };
  }

  if (auth.session.role === "vendor" && auth.session.vendorSlug !== blog.vendorSlug) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "You can only manage blogs for your own store." },
        { status: 403 },
      ),
    };
  }

  return { ok: true as const, blog };
}

function revalidateBlogPaths(oldSlug: string, nextSlug?: string) {
  revalidatePath("/blog");
  revalidatePath(`/blog/${oldSlug}`);
  if (nextSlug && nextSlug !== oldSlug) {
    revalidatePath(`/blog/${nextSlug}`);
  }
  revalidatePath("/dashboard/admin/blogs");
  revalidatePath("/dashboard/vendor/blogs");
  revalidatePath("/dashboard/vendor/ai");
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const allowed = await requireManageableBlog(request, id);
  if (!allowed.ok) return allowed.response;

  try {
    const body = (await request.json()) as BlogUpdateBody;
    const updated = await updateBlogById(id, {
      title: body.title,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      slug: body.slug,
      excerpt: body.excerpt,
      body: body.body,
      keywords: toList(body.keywords),
      hashtags: toList(body.hashtags),
    });

    if (!updated) {
      return NextResponse.json({ error: "Blog not found." }, { status: 404 });
    }

    revalidateBlogPaths(allowed.blog.slug, updated.slug);
    return NextResponse.json({ blog: updated, url: `/blog/${updated.slug}` });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update blog." },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const allowed = await requireManageableBlog(request, id);
  if (!allowed.ok) return allowed.response;

  const deleted = await deleteBlogById(id);
  if (!deleted) {
    return NextResponse.json({ error: "Blog not found." }, { status: 404 });
  }

  revalidateBlogPaths(deleted.slug);
  return NextResponse.json({ ok: true });
}
