import Image from "next/image";
import Link from "next/link";
import {
  Check,
  ChevronRight,
  Gamepad2,
  Headphones,
  HeartPulse,
  Home as HomeIcon,
  Monitor,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Truck,
  Watch,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { HeroSlider, type HeroSlide } from "@/components/hero-slider";
import { ProductCard } from "@/components/product-card";
import {
  getPublicCategorySummaries,
  getPublicFeaturedProducts,
  getPublicProducts,
  getPublicTopVendors,
  getPublicVendors,
} from "@/lib/public-marketplace";
import type { Product, Vendor } from "@/lib/marketplace";
import { formatCompactNumber, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

type CategoryLink = {
  name: string;
  icon: LucideIcon;
  href: string;
  blurb: string;
  category?: string;
};

const desktopCategories: CategoryLink[] = [
  {
    name: "Official Stores",
    icon: Store,
    href: "/vendors",
    blurb: "Verified sellers and branded shops",
  },
  {
    name: "Phones & Tablets",
    icon: Smartphone,
    href: "/catalog?category=Mobile+Essentials",
    blurb: "Phones, chargers, earbuds and power banks",
    category: "Mobile Essentials",
  },
  {
    name: "Audio",
    icon: Headphones,
    href: "/catalog?category=Audio",
    blurb: "Headphones, speakers and DAC gear",
    category: "Audio",
  },
  {
    name: "Gaming",
    icon: Gamepad2,
    href: "/catalog?category=Gaming",
    blurb: "Controllers, pads, headsets and chairs",
    category: "Gaming",
  },
  {
    name: "Creator Gear",
    icon: Monitor,
    href: "/catalog?category=Creator+Gear",
    blurb: "Desk setups, keyboards, docks and lights",
    category: "Creator Gear",
  },
  {
    name: "Wearables",
    icon: Watch,
    href: "/catalog?category=Wearables",
    blurb: "Smart watches and fitness essentials",
    category: "Wearables",
  },
  {
    name: "Beauty & Personal Care",
    icon: Sparkles,
    href: "/catalog?category=Beauty+%26+Personal+Care",
    blurb: "Serums, cleansers, SPF, and daily glow routines",
    category: "Beauty & Personal Care",
  },
  {
    name: "Health & Wellness",
    icon: HeartPulse,
    href: "/catalog?category=Health+%26+Wellness",
    blurb: "Recovery kits, sleep blends, and wellness support",
    category: "Health & Wellness",
  },
  {
    name: "Home Control",
    icon: HomeIcon,
    href: "/catalog?category=Home+Control",
    blurb: "Smart home hubs, sensors and lighting",
    category: "Home Control",
  },
];

const shortcutTiles = [
  { label: "Flash Sale", href: "#flash-sale", icon: Zap },
  { label: "Phones", href: "/catalog?category=Mobile+Essentials", icon: Smartphone, category: "Mobile Essentials" },
  { label: "Audio", href: "/catalog?category=Audio", icon: Headphones, category: "Audio" },
  { label: "Gaming", href: "/catalog?category=Gaming", icon: Gamepad2, category: "Gaming" },
  { label: "Creator", href: "/catalog?category=Creator+Gear", icon: Monitor, category: "Creator Gear" },
  { label: "Home", href: "/catalog?category=Home+Control", icon: HomeIcon, category: "Home Control" },
  { label: "Beauty", href: "/catalog?category=Beauty+%26+Personal+Care", icon: Sparkles, category: "Beauty & Personal Care" },
  { label: "Wellness", href: "/catalog?category=Health+%26+Wellness", icon: HeartPulse, category: "Health & Wellness" },
  { label: "Stores", href: "/vendors", icon: Store },
  { label: "Request", href: "/request-product", icon: Sparkles },
] as const;

const promiseItems = [
  "Verified vendors before products go live",
  "Dense shelves that are easy to scan quickly",
  "Live order help and request-product flow",
] as const;

export default async function Home() {
  const [featuredProducts, topVendors, publicProducts, publicVendors, categorySummaries] = await Promise.all([
    getPublicFeaturedProducts(),
    getPublicTopVendors(),
    getPublicProducts(),
    getPublicVendors(),
    getPublicCategorySummaries(),
  ]);
  const visibleCategorySet = new Set(
    categorySummaries.filter((category) => !category.hidden).map((category) => category.name),
  );
  const homepageCategories = desktopCategories.filter(
    (category) => !category.category || visibleCategorySet.has(category.category),
  );
  const homepageShortcutTiles = shortcutTiles.filter(
    (tile) => !("category" in tile) || !tile.category || visibleCategorySet.has(tile.category),
  );

  const discountProducts = [...publicProducts]
    .filter((product) => product.compareAt && product.compareAt > product.price)
    .sort((a, b) => {
      const discountA = a.compareAt ? (a.compareAt - a.price) / a.compareAt : 0;
      const discountB = b.compareAt ? (b.compareAt - b.price) / b.compareAt : 0;
      return discountB - discountA || b.reviewCount - a.reviewCount;
    });

  const flashSaleProducts = discountProducts.slice(0, 10);
  const topSellingProducts = [...publicProducts]
    .sort((a, b) => b.reviewCount - a.reviewCount || b.rating - a.rating)
    .slice(0, 10);
  const homeDeals = publicProducts
    .filter((product) => product.category === "Home Control")
    .slice(0, 10);
  const phoneDeals = publicProducts
    .filter((product) => product.category === "Mobile Essentials" || product.category === "Wearables")
    .slice(0, 10);
  const creatorDeals = publicProducts
    .filter(
      (product) =>
        product.category === "Creator Gear" ||
        product.category === "Gaming" ||
        product.category === "Audio",
    )
    .slice(0, 10);
  const beautyDeals = publicProducts
    .filter((product) => product.category === "Beauty & Personal Care")
    .slice(0, 10);
  const wellnessDeals = publicProducts
    .filter((product) => product.category === "Health & Wellness")
    .slice(0, 10);

  const heroProduct =
    flashSaleProducts[0] ??
    featuredProducts[0] ??
    topSellingProducts[0] ??
    publicProducts[0];
  const sidebarProduct =
    topSellingProducts.find((product) => product.slug !== heroProduct.slug) ?? heroProduct;
  const promoProduct =
    creatorDeals.find((product) => product.slug !== heroProduct.slug) ?? sidebarProduct;

  const averageFulfillment = publicVendors.length
    ? publicVendors.reduce((total, vendor) => total + Number.parseFloat(vendor.fulfillmentRate), 0) / publicVendors.length
    : 0;

  const heroStats = [
    { iconKey: "package", label: "Live products", value: formatCompactNumber(publicProducts.length) },
    { iconKey: "shield", label: "Vendors", value: formatCompactNumber(publicVendors.length) },
    { iconKey: "trending", label: "Fulfillment", value: `${averageFulfillment.toFixed(1)}%` },
  ] as const;

  const heroSlides: HeroSlide[] = [
    {
      title: "Flash deals from verified sellers.",
      subtitle:
        "Shop a dense marketplace of tech, beauty, wellness, and home essentials with clear markdowns and fast ordering.",
      image: heroProduct.heroImage,
      ctaText: "Shop flash sale",
      ctaHref: "#flash-sale",
      badge: "Marketplace savings",
      chips: ["Flash sale", "Official stores", "Fast dispatch"],
    },
  ];

  if (beautyDeals[0]) {
    heroSlides.push({
      title: "Beauty and personal care is live.",
      subtitle: `${beautyDeals[0].name} leads a new shelf for skincare, SPF, and daily routine essentials.`,
      image: beautyDeals[0].heroImage,
      ctaText: "Shop beauty",
      ctaHref: "/catalog?category=Beauty+%26+Personal+Care",
      badge: "Beauty shelf",
      chips: ["Skincare", "SPF", "Daily routines"],
    });
  }

  if (wellnessDeals[0]) {
    heroSlides.push({
      title: "Wellness picks for rest and recovery.",
      subtitle: `${wellnessDeals[0].name} anchors wellness products for recovery, sleep, and everyday balance.`,
      image: wellnessDeals[0].heroImage,
      ctaText: "Shop wellness",
      ctaHref: "/catalog?category=Health+%26+Wellness",
      badge: "Health & wellness",
      chips: ["Recovery", "Sleep support", "Wellness"],
    });
  }

  heroSlides.push({
    title: "Vendors, requests, and tracking in one place.",
    subtitle:
      "Browse trusted storefronts, request hard-to-find products, and follow order updates without leaving SuperTech.",
    image: sidebarProduct.heroImage,
    ctaText: "Browse vendors",
    ctaHref: "/vendors",
    badge: "Shopper tools",
    chips: ["Vendors", "Request product", "Track order"],
  });

  return (
    <div className="pb-20 sm:pb-0">
      <section className="page-shell py-4 sm:py-6">
        <div className="grid gap-3 lg:auto-rows-[440px] lg:grid-cols-[220px_minmax(0,1fr)_250px]">
          <aside className="hidden lg:block">
            <div className="soft-card h-full overflow-y-auto p-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="border-b border-[var(--line)] px-1 pb-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                  Browse categories
                </p>
              </div>
              <div className="mt-2 space-y-1">
                {homepageCategories.map((category) => (
                  <Link
                    key={category.name}
                    href={category.href}
                    className="flex items-start gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-[var(--accent-soft)]"
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fff3e1] text-[var(--accent)]">
                      <category.icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-[var(--foreground)]">
                        {category.name}
                      </span>
                      <span className="mt-0.5 block text-xs leading-5 text-[var(--muted)]">
                        {category.blurb}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          <HeroSlider stats={heroStats} slides={heroSlides} />

          <div className="grid gap-3 lg:h-full lg:overflow-y-auto lg:pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <PromoProductCard
              eyebrow="Today&apos;s standout"
              title={sidebarProduct.name}
              price={formatPrice(sidebarProduct.price)}
              compareAt={sidebarProduct.compareAt ? formatPrice(sidebarProduct.compareAt) : null}
              href={`/products/${sidebarProduct.slug}`}
              image={sidebarProduct.heroImage}
            />

            <div className="soft-card p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Marketplace promise
              </p>
              <h2 className="mt-2 text-lg font-bold tracking-[-0.03em] text-[var(--foreground)]">
                Verified commerce, not just visual polish.
              </h2>
              <ul className="mt-4 space-y-3">
                {promiseItems.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-[var(--foreground)]">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                      <Check className="h-3 w-3" />
                    </span>
                    <span className="leading-6">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <PromoProductCard
              eyebrow="Creator & gaming"
              title={promoProduct.name}
              price={formatPrice(promoProduct.price)}
              compareAt={promoProduct.compareAt ? formatPrice(promoProduct.compareAt) : null}
              href={`/products/${promoProduct.slug}`}
              image={promoProduct.heroImage}
            />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
          {homepageShortcutTiles.map((tile) => (
            <Link
              key={tile.label}
              href={tile.href}
              className="soft-card flex items-center gap-3 px-3 py-3 transition-colors hover:bg-[var(--accent-soft)]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fff3e1] text-[var(--accent)]">
                <tile.icon className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold text-[var(--foreground)]">{tile.label}</span>
            </Link>
          ))}
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <ServiceCard
            icon={Truck}
            title="Fast logistics"
            description="Same-city delivery cues and dispatch-focused shelf copy."
          />
          <ServiceCard
            icon={ShieldCheck}
            title="Verified sellers"
            description="Every store is approved before products become public."
          />
          <ServiceCard
            icon={Sparkles}
            title="Request products"
            description="Shoppers can ask for specific tech not yet listed in the catalog."
          />
        </div>
      </section>

      <section className="page-shell space-y-4 pb-6 sm:space-y-5 sm:pb-10">
        <ShelfSection
          id="flash-sale"
          kicker="Limited-time deals"
          title="Flash Sales"
          description={`High-discount products with the strongest markdowns across ${formatCompactNumber(flashSaleProducts.length)} live offers.`}
          href="/catalog"
          headerClass="bg-gradient-to-r from-[#d53e29] to-[#f68b1e] text-white"
          theme="dark"
          products={flashSaleProducts}
        />

        <ShelfSection
          kicker="Most purchased"
          title="Top selling items"
          description="Best-performing products sorted by review activity and customer traction."
          href="/catalog"
          headerClass="bg-[#313133] text-white"
          theme="dark"
          products={topSellingProducts}
        />

        <VendorShelf vendors={topVendors} />

        {visibleCategorySet.has("Home Control") ? (
          <ShelfSection
            kicker="Refresh & automate"
            title="Home control picks"
            description="Smart-home and desk utility products merchandised as a home-focused deal shelf."
            href="/catalog?category=Home+Control"
            headerClass="bg-gradient-to-r from-[#18846f] to-[#44b49a] text-white"
            theme="dark"
            products={homeDeals}
          />
        ) : null}

        {visibleCategorySet.has("Mobile Essentials") || visibleCategorySet.has("Wearables") ? (
          <ShelfSection
            kicker="Stay connected"
            title="Phones & wearables"
            description="The mobile lane combines everyday carry gear, watches, charging, and audio companions."
            href="/catalog?category=Mobile+Essentials"
            headerClass="bg-gradient-to-r from-[#2258b8] to-[#4b88ff] text-white"
            theme="dark"
            products={phoneDeals}
          />
        ) : null}

        {visibleCategorySet.has("Beauty & Personal Care") ? (
          <ShelfSection
            kicker="Glow and routine"
            title="Beauty & personal care"
            description="Skincare, SPF, and routine staples merchandised as a dedicated beauty lane."
            href="/catalog?category=Beauty+%26+Personal+Care"
            headerClass="bg-gradient-to-r from-[#c14f7a] to-[#f1a6c3] text-white"
            theme="dark"
            products={beautyDeals}
          />
        ) : null}

        {visibleCategorySet.has("Health & Wellness") ? (
          <ShelfSection
            kicker="Rest and recovery"
            title="Health & wellness"
            description="Recovery kits, gummies, and sleep-support products organized as a wellness shelf."
            href="/catalog?category=Health+%26+Wellness"
            headerClass="bg-gradient-to-r from-[#3e8f68] to-[#9ad7b6] text-white"
            theme="dark"
            products={wellnessDeals}
          />
        ) : null}

        {visibleCategorySet.has("Creator Gear") ||
        visibleCategorySet.has("Gaming") ||
        visibleCategorySet.has("Audio") ? (
          <ShelfSection
            kicker="Desk, audio & play"
            title="Creator and gaming essentials"
            description="Dense product rows for creator setups, audio hardware, and gaming upgrades."
            href="/catalog?category=Creator+Gear"
            headerClass="bg-gradient-to-r from-[#6840c6] to-[#9f6cff] text-white"
            theme="dark"
            products={creatorDeals}
          />
        ) : null}
      </section>
    </div>
  );
}

type PromoProductCardProps = {
  eyebrow: string;
  title: string;
  price: string;
  compareAt: string | null;
  href: string;
  image: string;
};

function PromoProductCard({
  eyebrow,
  title,
  price,
  compareAt,
  href,
  image,
}: PromoProductCardProps) {
  return (
    <Link href={href} className="soft-card group flex items-center gap-3 overflow-hidden p-3">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-[#f7f7f7]">
        <Image src={image} alt={title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="96px" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          {eyebrow}
        </p>
        <h2 className="mt-1 line-clamp-2 text-base font-bold leading-5 tracking-[-0.03em] text-[var(--foreground)]">
          {title}
        </h2>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <span className="font-bold text-[var(--foreground)]">{price}</span>
          {compareAt ? <span className="text-[var(--muted)] line-through">{compareAt}</span> : null}
        </div>
      </div>
    </Link>
  );
}

type ServiceCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

function ServiceCard({ icon: Icon, title, description }: ServiceCardProps) {
  return (
    <div className="soft-card flex items-start gap-3 p-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#fff3e1] text-[var(--accent)]">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-bold text-[var(--foreground)]">{title}</p>
        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{description}</p>
      </div>
    </div>
  );
}

type ShelfSectionProps = {
  id?: string;
  kicker: string;
  title: string;
  description: string;
  href: string;
  headerClass: string;
  theme: "dark" | "light";
  products: Product[];
};

function ShelfSection({
  id,
  kicker,
  title,
  description,
  href,
  headerClass,
  theme,
  products,
}: ShelfSectionProps) {
  if (products.length === 0) {
    return null;
  }

  const linkClass =
    theme === "dark"
      ? "border-white/18 bg-white/12 text-white hover:bg-white/18"
      : "border-[var(--line)] bg-white text-[var(--foreground)] hover:bg-[var(--accent-soft)]";

  return (
    <section id={id} className="soft-card overflow-hidden">
      <div className={`flex items-center justify-between gap-4 px-4 py-3 ${headerClass}`}>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-85">{kicker}</p>
          <h2 className="mt-1 text-lg font-black tracking-[-0.03em] sm:text-xl">{title}</h2>
        </div>
        <Link
          href={href}
          className={`hidden rounded-md border px-3 py-2 text-sm font-semibold sm:inline-flex ${linkClass}`}
        >
          See all
        </Link>
      </div>

      <div className="border-b border-[var(--line)] px-4 py-3">
        <p className="text-sm leading-6 text-[var(--muted)]">{description}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 p-3 md:grid-cols-4 xl:grid-cols-5">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>

      <div className="border-t border-[var(--line)] px-3 py-3 sm:hidden">
        <Link
          href={href}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)]"
        >
          See all
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function VendorShelf({ vendors }: { vendors: Vendor[] }) {
  if (vendors.length === 0) {
    return null;
  }

  return (
    <section className="soft-card overflow-hidden">
      <div className="flex items-center justify-between gap-4 bg-[#313133] px-4 py-3 text-white">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">
            Trusted sellers
          </p>
          <h2 className="mt-1 text-lg font-black tracking-[-0.03em] sm:text-xl">
            Official Stores
          </h2>
        </div>
        <Link
          href="/vendors"
          className="hidden rounded-md border border-white/18 bg-white/12 px-3 py-2 text-sm font-semibold text-white hover:bg-white/18 sm:inline-flex"
        >
          See all
        </Link>
      </div>

      <div className="grid gap-3 p-3 sm:grid-cols-2 xl:grid-cols-4">
        {vendors.map((vendor) => (
          <Link
            key={vendor.id}
            href={`/vendors/${vendor.slug}`}
            className="group overflow-hidden rounded-lg border border-[var(--line)] bg-white"
          >
            <div className="relative h-36 overflow-hidden">
              <Image
                src={vendor.coverImage}
                alt={vendor.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(min-width: 1280px) 22vw, (min-width: 640px) 40vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              <div
                className="absolute bottom-3 left-3 flex h-11 w-11 items-center justify-center rounded-full border-2 border-white text-sm font-black text-white shadow-sm"
                style={{ backgroundColor: vendor.accent }}
              >
                {vendor.logoMark}
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-base font-bold tracking-[-0.03em] text-[var(--foreground)]">
                {vendor.name}
              </h3>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{vendor.headline}</p>
              <div className="mt-4 flex items-center justify-between text-sm text-[var(--muted)]">
                <span>{vendor.activeProducts} products</span>
                <span className="inline-flex items-center gap-1 font-semibold text-[var(--foreground)]">
                  <Star className="h-3.5 w-3.5 fill-[var(--gold)] text-[var(--gold)]" />
                  {vendor.rating.toFixed(1)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="border-t border-[var(--line)] px-3 py-3 sm:hidden">
        <Link
          href="/vendors"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)]"
        >
          See all
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
