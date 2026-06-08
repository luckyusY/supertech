import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ShieldCheck, Star } from "lucide-react";
import { AppBottomTabs } from "@/components/app-bottom-tabs";
import { getPublicVendors } from "@/lib/public-marketplace";

export const dynamic = "force-dynamic";

export default async function AppVendorsPage() {
  const vendors = await getPublicVendors();

  return (
    <div className="min-h-screen bg-[#f3f6f2] pb-24 text-[#102019]">
      <header className="sticky top-0 z-40 border-b border-black/6 bg-[#f3f6f2]/92 px-4 py-3 backdrop-blur">
        <div className="mx-auto max-w-md">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#66736b]">
            Official stores
          </p>
          <h1 className="text-2xl font-black tracking-[-0.04em]">Vendors</h1>
        </div>
      </header>
      <main className="mx-auto max-w-md space-y-3 px-4 py-4">
        {vendors.map((vendor) => (
          <Link
            key={vendor.id}
            href={`/vendors/${vendor.slug}`}
            className="block overflow-hidden rounded-lg bg-white shadow-sm"
          >
            <div className="relative h-32">
              <Image src={vendor.coverImage} alt={vendor.name} fill className="object-cover" sizes="448px" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/62 to-transparent" />
              <div
                className="absolute bottom-3 left-3 grid h-12 w-12 place-items-center rounded-lg text-sm font-black text-white"
                style={{ backgroundColor: vendor.accent }}
              >
                {vendor.logoMark}
              </div>
            </div>
            <div className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-lg font-black">{vendor.name}</h2>
                  <ShieldCheck className="h-4 w-4 shrink-0 text-[#f68b1e]" />
                </div>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#66736b]">
                  {vendor.headline}
                </p>
                <p className="mt-2 flex items-center gap-1 text-xs font-bold text-[#66736b]">
                  <Star className="h-3.5 w-3.5 fill-[#f4c95d] text-[#f4c95d]" />
                  {vendor.rating.toFixed(1)} | {vendor.activeProducts} products
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-[#66736b]" />
            </div>
          </Link>
        ))}
      </main>
      <AppBottomTabs />
    </div>
  );
}
