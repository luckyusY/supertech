import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { authorizeRequest } from "@/lib/auth";
import { hideItem, unhideItem } from "@/lib/hidden-items";
import { products as seedProducts } from "@/lib/marketplace";
import {
  deleteProductSubmission,
  getProductSubmissions,
} from "@/lib/product-submissions";
import { getAdminProductHiddenSlugs } from "@/lib/public-marketplace";

export const dynamic = "force-dynamic";

async function productPayload() {
  const [submissions, hiddenSlugs] = await Promise.all([
    getProductSubmissions({ limit: 100 }).catch(() => []),
    getAdminProductHiddenSlugs(),
  ]);

  return {
    submissions,
    seedProducts: seedProducts.map((product) => ({
      slug: product.slug,
      name: product.name,
      vendorSlug: product.vendorSlug,
      category: product.category,
      price: product.price,
      heroImage: product.heroImage,
      disabled: hiddenSlugs.has(product.slug),
    })),
  };
}

function revalidateProducts() {
  revalidatePath("/dashboard/admin/products");
  revalidatePath("/catalog");
  revalidatePath("/");
}

export async function GET(request: Request) {
  const auth = authorizeRequest(request, ["admin"]);
  if (!auth.ok) return auth.response;

  return NextResponse.json(await productPayload());
}

export async function PATCH(request: Request) {
  const auth = authorizeRequest(request, ["admin"]);
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json()) as {
      slug?: string;
      id?: string;
      action?: "enable" | "disable" | "delete";
      isSeed?: boolean;
    };

    if (body.action === "enable" || body.action === "disable") {
      const slug = body.slug?.trim();
      if (!slug) {
        return NextResponse.json({ error: "Product slug is required." }, { status: 400 });
      }
      if (body.action === "enable") {
        await unhideItem("product", slug);
      } else {
        await hideItem("product", slug);
      }
    } else if (body.action === "delete") {
      if (body.isSeed) {
        const slug = body.slug?.trim();
        if (!slug) {
          return NextResponse.json({ error: "Product slug is required." }, { status: 400 });
        }
        await hideItem("product", slug);
      } else {
        const id = body.id?.trim();
        if (!id) {
          return NextResponse.json({ error: "Product id is required." }, { status: 400 });
        }
        await deleteProductSubmission(id);
      }
    } else {
      return NextResponse.json({ error: "Unsupported product action." }, { status: 400 });
    }

    revalidateProducts();
    return NextResponse.json({ ok: true, ...(await productPayload()) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update product." },
      { status: 400 },
    );
  }
}
