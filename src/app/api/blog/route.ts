import { NextResponse } from "next/server";
import { authorizeRequest } from "@/lib/auth";
import { hasMongoConfig } from "@/lib/integrations";
import { createBlog, getPublishedBlogs } from "@/lib/blogs";
import { getPublicProductBySlug, getPublicVendors } from "@/lib/public-marketplace";

export async function GET() {
  if (!hasMongoConfig()) {
    return NextResponse.json({ blogs: [] });
  }
  try {
    const blogs = await getPublishedBlogs(50);
    return NextResponse.json({ blogs });
  } catch {
    return NextResponse.json({ blogs: [] });
  }
}

type PublishBody = {
  productSlug?: string;
  title?: string;
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
  excerpt?: string;
  body?: string;
  keywords?: unknown;
  hashtags?: unknown;
};

export async function POST(request: Request) {
  const auth = authorizeRequest(request, ["admin", "vendor"]);
  if (!auth.ok) {
    return auth.response;
  }

  if (!hasMongoConfig()) {
    return NextResponse.json(
      { error: "Publishing requires the database to be configured." },
      { status: 503 },
    );
  }

  let body: PublishBody;
  try {
    body = (await request.json()) as PublishBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const productSlug = String(body.productSlug || "").trim();
  const title = String(body.title || "").trim();
  const articleBody = String(body.body || "").trim();

  if (!productSlug || !title || !articleBody) {
    return NextResponse.json(
      { error: "Product, title, and article body are required." },
      { status: 400 },
    );
  }

  // Re-fetch the product server-side so the blog carries real product images,
  // price, and vendor — never trust client-supplied media.
  const product = await getPublicProductBySlug(productSlug);
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  // Vendors may only publish blogs for their own products.
  if (auth.session.role === "vendor" && auth.session.vendorSlug !== product.vendorSlug) {
    return NextResponse.json(
      { error: "You can only publish blogs for your own products." },
      { status: 403 },
    );
  }

  const vendors = await getPublicVendors();
  const vendorName =
    vendors.find((vendor) => vendor.slug === product.vendorSlug)?.name ?? product.vendorSlug;

  const gallery = Array.from(
    new Set([product.heroImage, ...(product.gallery ?? [])].filter(Boolean)),
  );

  const toList = (value: unknown) =>
    Array.isArray(value) ? value.map((item) => String(item)) : [];

  try {
    const blog = await createBlog({
      slug: body.slug ? String(body.slug) : title,
      title,
      metaTitle: body.metaTitle ? String(body.metaTitle) : undefined,
      metaDescription: body.metaDescription ? String(body.metaDescription) : undefined,
      excerpt: body.excerpt ? String(body.excerpt) : undefined,
      body: articleBody,
      keywords: toList(body.keywords),
      hashtags: toList(body.hashtags),
      productSlug: product.slug,
      productName: product.name,
      vendorSlug: product.vendorSlug,
      vendorName,
      category: product.category,
      price: product.price,
      heroImage: product.heroImage,
      gallery,
      authorEmail: auth.session.email,
      authorRole: auth.session.role,
    });

    return NextResponse.json({ blog, url: `/blog/${blog.slug}` }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to publish blog." },
      { status: 500 },
    );
  }
}
