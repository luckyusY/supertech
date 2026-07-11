import Image from "next/image";
import Link from "next/link";
import {
  Briefcase,
  Building2,
  Car,
  ChevronRight,
  Gamepad2,
  Headphones,
  HeartPulse,
  Home as HomeIcon,
  Landmark,
  Monitor,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Watch,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { CampaignBannerSlider, type CampaignSlide } from "@/components/campaign-banner-slider";
import { GsapReveal, GsapShelfMotion } from "@/components/gsap-reveal";
import { HeroSlider, type HeroSlide } from "@/components/hero-slider";
import { ProductCard } from "@/components/product-card";
import { TrustStrip } from "@/components/trust-strip";
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

const mainCampaignSlides: CampaignSlide[] = [
  {
    image: "/banners/flash-sale-campaign.png",
    kicker: "Hot marketplace picks",
    title: "Deals across beauty, gadgets, home, and more",
    description: "A fast, visual shopping lane for the best approved products on SuperTech.",
    href: "/catalog",
    cta: "Shop all deals",
  },
  {
    image: "/banners/groceries-campaign.png",
    kicker: "Everyday essentials",
    title: "Groceries and home supplies in one place",
    description: "Browse daily-use products, pantry picks, and household basics from approved sellers.",
    href: "/catalog",
    cta: "Shop essentials",
    align: "left",
  },
  {
    image: "/banners/fashion-campaign.png",
    kicker: "Style deals",
    title: "Shoes, bags, fashion, and accessories",
    description: "Fresh visual deals for fashion, footwear, and accessories across the marketplace.",
    href: "/catalog",
    cta: "Shop fashion",
  },
  {
    image: "/banners/gadgets-campaign.png",
    kicker: "Phones & accessories",
    title: "Smart gadgets for everyday shopping",
    description: "Phones, watches, earbuds, charging gear, and mobile essentials in one dense shelf.",
    href: "/catalog?category=Mobile+Essentials",
    cta: "Shop gadgets",
    align: "left",
  },
];

const gadgetsCampaignSlides: CampaignSlide[] = [
  {
    image: "/banners/gadgets-campaign.png",
    kicker: "Phones & accessories",
    title: "Smart gadgets for everyday shopping",
    description: "Phones, watches, earbuds, charging gear, and mobile essentials in one dense shelf.",
    href: "/catalog?category=Mobile+Essentials",
    cta: "Shop gadgets",
    align: "left",
  },
  {
    image: "/banners/flash-sale-campaign.png",
    kicker: "Tech markdowns",
    title: "Fast-moving gadgets and accessories",
    description: "See mobile essentials, audio gear, power accessories, and daily tech deals.",
    href: "/catalog?category=Mobile+Essentials",
    cta: "Shop gadgets",
  },
];

const beautyCampaignSlides: CampaignSlide[] = [
  {
    image: "/banners/beauty-wellness-campaign.png",
    kicker: "Beauty & wellness",
    title: "Daily care, glow, and recovery products",
    description: "Skincare, hair care, wellness, and personal care picks from approved sellers.",
    href: "/catalog?category=Beauty+%26+Personal+Care",
    cta: "Shop beauty",
  },
  {
    image: "/banners/fashion-campaign.png",
    kicker: "Fresh style",
    title: "Complete your routine with style picks",
    description: "Pair personal care with fashion, shoes, accessories, and daily essentials.",
    href: "/catalog?category=Beauty+%26+Personal+Care",
    cta: "Shop beauty",
    align: "left",
  },
];

const autoPropertyCampaignSlides: CampaignSlide[] = [
  {
    image: "/banners/auto-property-campaign.png",
    kicker: "Motors & property",
    title: "Cars, rentals, apartments, and land",
    description: "Browse bigger-ticket listings from sellers and agents in the marketplace.",
    href: "/catalog?category=Cars+for+Sale",
    cta: "Explore listings",
    align: "left",
  },
  {
    image: "/banners/groceries-campaign.png",
    kicker: "Marketplace lanes",
    title: "From daily essentials to major listings",
    description: "Move between household products, services, motors, and property from one catalog.",
    href: "/catalog",
    cta: "Browse catalog",
  },
];

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
  {
    name: "Cars for Sale",
    icon: Car,
    href: "/catalog?category=Cars+for+Sale",
    blurb: "New and used cars from verified dealers",
    category: "Cars for Sale",
  },
  {
    name: "Cars for Rent",
    icon: Car,
    href: "/catalog?category=Cars+for+Rent",
    blurb: "Daily, weekly and monthly car rentals",
    category: "Cars for Rent",
  },
  {
    name: "Apartments for Sale",
    icon: Building2,
    href: "/catalog?category=Apartments+for+Sale",
    blurb: "Studios and apartments from trusted agents",
    category: "Apartments for Sale",
  },
  {
    name: "Apartments for Rent",
    icon: Building2,
    href: "/catalog?category=Apartments+for+Rent",
    blurb: "Short and long-term rental listings",
    category: "Apartments for Rent",
  },
  {
    name: "Land for Sale",
    icon: Landmark,
    href: "/catalog?category=Land+for+Sale",
    blurb: "Residential and commercial plots",
    category: "Land for Sale",
  },
  {
    name: "Commercial Spaces",
    icon: Briefcase,
    href: "/catalog?category=Commercial+Spaces",
    blurb: "Offices, shops and warehouse spaces",
    category: "Commercial Spaces",
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
  const carDeals = publicProducts
    .filter((product) => product.category === "Cars for Sale" || product.category === "Cars for Rent")
    .slice(0, 10);
  const propertyDeals = publicProducts
    .filter((product) =>
      product.category === "Apartments for Sale" ||
      product.category === "Apartments for Rent" ||
      product.category === "Land for Sale" ||
      product.category === "Commercial Spaces",
    )
    .slice(0, 10);

  const sidebarProduct =
    flashSaleProducts[0] ??
    featuredProducts[0] ??
    topSellingProducts[0] ??
    publicProducts[0];

  const fulfillmentRates = publicVendors
    .map((vendor) => Number.parseFloat(vendor.fulfillmentRate))
    .filter((rate) => Number.isFinite(rate));
  const averageFulfillment = fulfillmentRates.length
    ? fulfillmentRates.reduce((total, rate) => total + rate, 0) / fulfillmentRates.length
    : null;

  const heroStats = [
    { icon: "package" as const, label: "Live products", value: formatCompactNumber(publicProducts.length) },
    { icon: "shield" as const, label: "Vendors", value: formatCompactNumber(publicVendors.length) },
    {
      icon: "trending" as const,
      label: "Fulfillment",
      value: averageFulfillment === null ? "New" : `${averageFulfillment.toFixed(1)}%`,
    },
  ];

  // Campaign-led slides (max 4) — product photos only as last resort
  const heroSlides: HeroSlide[] = [
    {
      title: "Flash deals from verified sellers.",
      subtitle:
        "Shop tech, beauty, wellness, and home essentials with clear prices and trackable orders.",
      image: "/banners/flash-sale-campaign.png",
      ctaText: "Shop flash sale",
      ctaHref: "#flash-sale",
      badge: "Marketplace savings",
      chips: ["Verified sellers", "Request order", "Track status"],
      secondaryCtaText: "Browse catalog",
      secondaryCtaHref: "/catalog",
    },
  ];

  if (beautyDeals.length > 0) {
    heroSlides.push({
      title: "Beauty and personal care is live.",
      subtitle: "Skincare, SPF, and daily routine essentials from approved sellers.",
      image: "/banners/beauty-wellness-campaign.png",
      ctaText: "Shop beauty",
      ctaHref: "/catalog?category=Beauty+%26+Personal+Care",
      badge: "Beauty shelf",
      chips: ["Skincare", "SPF", "Routines"],
    });
  }

  if (phoneDeals.length > 0) {
    heroSlides.push({
      title: "Phones, wearables, and accessories.",
      subtitle: "Mobile essentials and daily tech from verified marketplace sellers.",
      image: "/banners/gadgets-campaign.png",
      ctaText: "Shop gadgets",
      ctaHref: "/catalog?category=Mobile+Essentials",
      badge: "Tech lane",
      chips: ["Phones", "Wearables", "Accessories"],
    });
  }

  heroSlides.push({
    title: "Request it. Track it. Get updates.",
    subtitle:
      "Can’t find a listing? Request the product. Already ordered? Track status without leaving SuperTech.",
    image: "/banners/groceries-campaign.png",
    ctaText: "Request a product",
    ctaHref: "/request-product",
    badge: "Shopper tools",
    chips: ["Request", "Track", "Vendors"],
    secondaryCtaText: "Track order",
    secondaryCtaHref: "/track-order",
  });

  const mobileCategoryChips = homepageCategories.slice(0, 10);

  return (
    <div className="marketplace-campaign-bg pb-20 sm:pb-0">
      <section className="page-shell py-4 sm:py-6">
        {/* ——— Hero triad ——— */}
        <div className="grid gap-3 lg:grid-cols-[210px_minmax(0,1fr)_250px] lg:items-stretch">
          <aside className="hidden lg:block">
            <div className="flex h-full max-h-[440px] flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--elevation-1)]">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                  Categories
                </p>
                <Link
                  href="/catalog"
                  className="text-[11px] font-bold text-[var(--accent)] hover:underline"
                >
                  See all
                </Link>
              </div>
              <div className="flex-1 space-y-0.5 overflow-y-auto p-1.5 [scrollbar-width:thin]">
                {homepageCategories.map((category) => (
                  <Link
                    key={category.name}
                    href={category.href}
                    className="group flex items-center gap-2.5 rounded-[var(--radius-sm)] px-2 py-2 transition-colors hover:bg-[var(--accent-soft)]"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--neutral-50)] text-[var(--accent)] transition-colors group-hover:bg-white">
                      <category.icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 truncate text-[13px] font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)]">
                      {category.name}
                    </span>
                    <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 text-[var(--muted)] opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          <div className="min-h-[300px] sm:min-h-[380px] lg:min-h-[420px]">
            <HeroSlider slides={heroSlides} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2">
            {sidebarProduct ? (
              <PromoProductCard
                eyebrow="Deal of the day"
                title={sidebarProduct.name}
                price={formatPrice(sidebarProduct.price)}
                compareAt={
                  sidebarProduct.compareAt ? formatPrice(sidebarProduct.compareAt) : null
                }
                href={`/products/${sidebarProduct.slug}`}
                image={sidebarProduct.heroImage}
              />
            ) : null}

            <div className="flex flex-col justify-between rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--elevation-1)]">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                  Need help?
                </p>
                <h2 className="mt-1.5 text-base font-bold tracking-[-0.02em] text-[var(--foreground)]">
                  Request or track in seconds
                </h2>
                <p className="mt-1.5 text-xs leading-5 text-[var(--muted)]">
                  Missing product? Already ordered? We&apos;ve got both paths.
                </p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link
                  href="/request-product"
                  className="inline-flex items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent)] px-2 py-2.5 text-center text-xs font-bold text-white hover:bg-[var(--accent-hover)]"
                >
                  Request
                </Link>
                <Link
                  href="/track-order"
                  className="inline-flex items-center justify-center rounded-[var(--radius-sm)] border border-[var(--line)] bg-white px-2 py-2.5 text-center text-xs font-bold text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  Track
                </Link>
              </div>
              <Link
                href="/vendors"
                className="mt-2 inline-flex items-center justify-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline"
              >
                Official stores
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        <GsapReveal className="mt-4" y={16} stagger={0}>
          <TrustStrip stats={heroStats} />
        </GsapReveal>

        {/* Mobile category chips — primary mobile entry (no duplicate shortcut grid) */}
        <GsapReveal className="mt-4 lg:hidden" y={18} delay={0.05}>
          <div className="scroll-x gap-2 pb-0.5">
            {mobileCategoryChips.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                data-reveal-item
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2 text-xs font-semibold text-[var(--foreground)] shadow-[var(--elevation-1)]"
              >
                <category.icon className="h-3.5 w-3.5 text-[var(--accent)]" />
                {category.name}
              </Link>
            ))}
            <Link
              href="/catalog"
              data-reveal-item
              className="inline-flex shrink-0 items-center rounded-full bg-[var(--accent)] px-3.5 py-2 text-xs font-bold text-white"
            >
              All
            </Link>
          </div>
        </GsapReveal>

        {/* Desktop quick lanes — compact icon rail */}
        <GsapReveal className="mt-4 hidden sm:block" y={20} stagger={0.04}>
          <div className="grid gap-2 sm:grid-cols-4 lg:grid-cols-8">
            {homepageShortcutTiles.slice(0, 8).map((tile) => (
              <Link
                key={tile.label}
                href={tile.href}
                data-reveal-item
                className="group flex flex-col items-center gap-2 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-2 py-3 text-center shadow-[var(--elevation-1)] transition-all hover:-translate-y-0.5 hover:border-[rgba(232,119,10,0.3)] hover:shadow-[var(--elevation-2)]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)] transition-colors group-hover:bg-[var(--accent)] group-hover:text-white">
                  <tile.icon className="h-4 w-4" />
                </span>
                <span className="text-xs font-semibold text-[var(--foreground)]">{tile.label}</span>
              </Link>
            ))}
          </div>
        </GsapReveal>
      </section>

      {/* ——— Merchandising ——— */}
      <section className="page-shell space-y-5 pb-8 sm:space-y-6 sm:pb-12">
        {flashSaleProducts.length > 0 || topSellingProducts.length > 0 ? (
          <CampaignBannerSlider slides={mainCampaignSlides} />
        ) : null}

        <ShelfSection
          id="flash-sale"
          kicker="Limited time"
          title="Flash sales"
          href="/catalog"
          headerClass="shelf-header-flash"
          theme="dark"
          products={flashSaleProducts}
          highlight
        />

        <ShelfSection
          kicker="Popular now"
          title="Top selling"
          href="/catalog"
          headerClass="shelf-header-topsell"
          theme="dark"
          products={topSellingProducts}
        />

        <VendorShelf vendors={topVendors} />

        {homeDeals.length > 0 ? (
          <ShelfSection
            kicker="Smart living"
            title="Home control"
            href="/catalog?category=Home+Control"
            headerClass="shelf-header-home"
            theme="dark"
            products={homeDeals}
          />
        ) : null}

        {phoneDeals.length > 0 ? (
          <>
            <CampaignBannerSlider slides={gadgetsCampaignSlides} />
            <ShelfSection
              kicker="Stay connected"
              title="Phones & wearables"
              href="/catalog?category=Mobile+Essentials"
              headerClass="shelf-header-phones"
              theme="dark"
              products={phoneDeals}
            />
          </>
        ) : null}

        {beautyDeals.length > 0 ? (
          <>
            <CampaignBannerSlider slides={beautyCampaignSlides} />
            <ShelfSection
              kicker="Glow up"
              title="Beauty & personal care"
              href="/catalog?category=Beauty+%26+Personal+Care"
              headerClass="shelf-header-beauty"
              theme="dark"
              products={beautyDeals}
            />
          </>
        ) : null}

        {wellnessDeals.length > 0 ? (
          <ShelfSection
            kicker="Feel better"
            title="Health & wellness"
            href="/catalog?category=Health+%26+Wellness"
            headerClass="shelf-header-wellness"
            theme="dark"
            products={wellnessDeals}
          />
        ) : null}

        {creatorDeals.length > 0 ? (
          <ShelfSection
            kicker="Create & play"
            title="Creator & gaming"
            href="/catalog?category=Creator+Gear"
            headerClass="shelf-header-creator"
            theme="dark"
            products={creatorDeals}
          />
        ) : null}

        {carDeals.length > 0 ? (
          <>
            <CampaignBannerSlider slides={autoPropertyCampaignSlides} />
            <ShelfSection
              kicker="Mobility"
              title="Cars for sale & rent"
              href="/catalog?category=Cars+for+Sale"
              headerClass="shelf-header-cars"
              theme="dark"
              products={carDeals}
            />
          </>
        ) : null}

        {propertyDeals.length > 0 ? (
          <ShelfSection
            kicker="Real estate"
            title="Property listings"
            href="/catalog?category=Apartments+for+Sale"
            headerClass="shelf-header-property"
            theme="dark"
            products={propertyDeals}
          />
        ) : null}

        <GsapReveal y={24}>
          <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-[var(--background-strong)] p-6 text-white sm:p-8">
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[var(--accent)]/25 blur-3xl"
              aria-hidden
            />
            <div className="relative flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/55">
                  Sell on SuperTech
                </p>
                <h2 className="mt-2 max-w-lg text-2xl font-bold tracking-[-0.03em] sm:text-[1.65rem]">
                  Reach shoppers who value verified sellers.
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
                  Apply once, list products, fulfill orders, and get paid the local way.
                </p>
              </div>
              <Link
                href="/become-vendor"
                className="inline-flex shrink-0 items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-[var(--accent-hover)]"
              >
                Become a vendor
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </GsapReveal>
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
    <Link
      href={href}
      className="group flex h-full items-center gap-3 overflow-hidden rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] p-3 shadow-[var(--elevation-1)] transition-all hover:border-[rgba(232,119,10,0.3)] hover:shadow-[var(--elevation-2)]"
    >
      <div className="relative h-[5.5rem] w-[5.5rem] shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--neutral-50)]">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="88px"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
          {eyebrow}
        </p>
        <h2 className="mt-1 line-clamp-2 text-sm font-bold leading-5 tracking-[-0.02em] text-[var(--foreground)]">
          {title}
        </h2>
        <div className="mt-1.5 flex flex-wrap items-baseline gap-1.5">
          <span className="text-base font-bold tabular-nums text-[var(--foreground)]">{price}</span>
          {compareAt ? (
            <span className="text-xs text-[var(--muted)] line-through">{compareAt}</span>
          ) : null}
        </div>
        <span className="mt-1 inline-flex items-center gap-0.5 text-[11px] font-semibold text-[var(--accent)]">
          Shop now
          <ChevronRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}

type ShelfSectionProps = {
  id?: string;
  kicker: string;
  title: string;
  href: string;
  headerClass: string;
  theme: "dark" | "light";
  products: Product[];
  highlight?: boolean;
};

function ShelfSection({
  id,
  kicker,
  title,
  href,
  headerClass,
  theme,
  products,
  highlight = false,
}: ShelfSectionProps) {
  if (products.length === 0) {
    return null;
  }

  const linkClass =
    theme === "dark"
      ? "border-white/20 bg-white/10 text-white hover:bg-white/18"
      : "border-[var(--line)] bg-white text-[var(--foreground)] hover:bg-[var(--accent-soft)]";

  // Flash sale (highlight): horizontal snap-scroll on mobile; grid from sm+
  const productTrackClass = highlight
    ? [
        "flex gap-3 overflow-x-auto bg-[var(--neutral-50)] p-3",
        "snap-x snap-mandatory scroll-pl-3 scroll-pr-3",
        "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        "sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:bg-white sm:p-3",
        "sm:snap-none md:grid-cols-4 xl:grid-cols-5",
      ].join(" ")
    : "grid grid-cols-2 gap-2.5 bg-[var(--neutral-50)] p-2.5 sm:gap-3 sm:p-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

  const cardShellClass = highlight
    ? "h-full w-[min(11.5rem,72vw)] shrink-0 snap-start sm:w-auto sm:min-w-0 sm:shrink"
    : "h-full";

  return (
    <GsapShelfMotion>
      <section
        id={id}
        className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--elevation-1)]"
      >
        <div
          data-shelf-header
          className={`flex items-center justify-between gap-3 px-3 py-3 sm:px-4 ${headerClass}`}
        >
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-85">{kicker}</p>
            <h2 className="mt-0.5 truncate text-lg font-bold tracking-[-0.03em] sm:text-xl">
              {title}
            </h2>
          </div>
          <Link
            href={href}
            className={`hidden shrink-0 items-center gap-1 rounded-[var(--radius-sm)] border px-3 py-2 text-xs font-bold sm:inline-flex ${linkClass}`}
          >
            See all
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div
          data-shelf-grid
          className={productTrackClass}
          role={highlight ? "list" : undefined}
        >
          {products.map((product, index) => (
            <div
              key={product.id}
              className={cardShellClass}
              role={highlight ? "listitem" : undefined}
            >
              <ProductCard product={product} index={index} />
            </div>
          ))}
          {highlight ? (
            <Link
              href={href}
              className="flex w-[min(7.5rem,40vw)] shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--line)] bg-white px-3 text-center sm:hidden"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                <ChevronRight className="h-5 w-5" />
              </span>
              <span className="text-xs font-bold text-[var(--foreground)]">See all deals</span>
            </Link>
          ) : null}
        </div>

        <div className="border-t border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 sm:hidden">
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-sm font-bold text-[var(--accent)]"
          >
            See all {title.toLowerCase()}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </GsapShelfMotion>
  );
}

function VendorShelf({ vendors }: { vendors: Vendor[] }) {
  if (vendors.length === 0) {
    return null;
  }

  return (
    <GsapShelfMotion>
    <section className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--elevation-1)]">
      <div
        data-shelf-header
        className="flex items-center justify-between gap-3 bg-[var(--background-strong)] px-3 py-3 text-white sm:px-4"
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">
            Trusted sellers
          </p>
          <h2 className="mt-0.5 text-lg font-bold tracking-[-0.03em] sm:text-xl">
            Official stores
          </h2>
        </div>
        <Link
          href="/vendors"
          className="hidden items-center gap-1 rounded-[var(--radius-sm)] border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/18 sm:inline-flex"
        >
          See all
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div data-shelf-grid className="grid gap-3 bg-[var(--neutral-50)] p-3 sm:grid-cols-2 xl:grid-cols-4">
        {vendors.map((vendor) => (
          <Link
            key={vendor.id}
            href={`/vendors/${vendor.slug}`}
            data-reveal-item
            className="group overflow-hidden rounded-[var(--radius-md)] border border-[var(--line)] bg-white shadow-[var(--elevation-1)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--elevation-2)]"
          >
            <div className="relative h-32 overflow-hidden sm:h-36">
              <Image
                src={vendor.coverImage}
                alt={vendor.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(min-width: 1280px) 22vw, (min-width: 640px) 40vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div
                className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-md"
                style={{ backgroundColor: vendor.accent }}
              >
                {vendor.logoMark}
              </div>
              <span className="absolute right-2 top-2 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-[var(--success)]">
                Verified
              </span>
            </div>
            <div className="p-3.5">
              <h3 className="truncate text-sm font-bold tracking-[-0.02em] text-[var(--foreground)]">
                {vendor.name}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--muted)]">
                {vendor.headline}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-[var(--muted)]">
                <span className="font-medium">{vendor.activeProducts} products</span>
                <span className="inline-flex items-center gap-1 font-semibold text-[var(--foreground)]">
                  <Star className="h-3 w-3 fill-[var(--gold)] text-[var(--gold)]" />
                  {vendor.rating.toFixed(1)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="border-t border-[var(--line)] px-3 py-2.5 sm:hidden">
        <Link
          href="/vendors"
          className="inline-flex items-center gap-1 text-sm font-bold text-[var(--accent)]"
        >
          See all stores
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
    </GsapShelfMotion>
  );
}
