import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { authorizeRequest } from "@/lib/auth";
import { hideItem, unhideItem } from "@/lib/hidden-items";
import { createCustomCategory, renameCategory } from "@/lib/mongodb-categories";
import { getPublicCategorySummaries } from "@/lib/public-marketplace";

export const dynamic = "force-dynamic";

function revalidateCategoryPaths() {
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/categories");
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath("/vendors");
}

export async function GET(request: Request) {
  const auth = authorizeRequest(request, ["admin"]);
  if (!auth.ok) return auth.response;

  const categories = await getPublicCategorySummaries();
  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  const auth = authorizeRequest(request, ["admin"]);
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json()) as { name?: string };
    await createCustomCategory(body.name ?? "");
    revalidateCategoryPaths();
    return NextResponse.json({ ok: true, categories: await getPublicCategorySummaries() });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create category." },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  const auth = authorizeRequest(request, ["admin"]);
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json()) as {
      action?: "show" | "hide" | "rename";
      name?: string;
      newName?: string;
    };
    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }

    if (body.action === "show") {
      await unhideItem("category", name);
    } else if (body.action === "hide") {
      await hideItem("category", name);
    } else if (body.action === "rename") {
      await renameCategory(name, body.newName ?? "");
    } else {
      return NextResponse.json({ error: "Unsupported category action." }, { status: 400 });
    }

    revalidateCategoryPaths();
    return NextResponse.json({ ok: true, categories: await getPublicCategorySummaries() });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update category." },
      { status: 400 },
    );
  }
}
