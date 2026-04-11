export type Vendor = {
  id: string;
  slug: string;
  name: string;
  headline: string;
  location: string;
  responseTime: string;
  rating: number;
  reviewCount: number;
  accent: string;
  coverImage: string;
  logoMark: string;
  categories: string[];
  activeProducts: number;
  fulfillmentRate: string;
  joined: string;
};

export type Product = {
  id: string;
  slug: string;
  vendorSlug: string;
  name: string;
  category: string;
  badge: string;
  description: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviewCount: number;
  stockLabel: string;
  shipWindow: string;
  accent: string;
  heroImage: string;
  gallery: string[];
  features: string[];
  featured?: boolean;
};

export type BuildPhase = {
  id: string;
  step: string;
  title: string;
  status: "done" | "active" | "next" | "planned";
  description: string;
  deliverables: string[];
};

export const marketplaceMetrics = [
  { label: "Launch lanes", value: "4" },
  { label: "Seed vendors", value: "4" },
  { label: "Ready routes", value: "7+" },
] as const;

export const categoryHighlights = [
  {
    name: "Home Control",
    count: 14,
    accent: "linear-gradient(90deg, #e45a36, #f2bf63)",
    description:
      "Smart hubs, sensors, and connected accessories designed for reliable daily automation.",
  },
  {
    name: "Mobile Essentials",
    count: 11,
    accent: "linear-gradient(90deg, #1a7b70, #7ad0bf)",
    description:
      "Charging, audio, and everyday carry tech with a sharper premium aesthetic.",
  },
  {
    name: "Creator Gear",
    count: 9,
    accent: "linear-gradient(90deg, #11211c, #45695b)",
    description:
      "Desk setups, peripherals, and tools for focused creators and power users.",
  },
] as const;

export const sellerChecklist = [
  "Review vendor application, commission plan, and payout method.",
  "Approve the first product batch with brand and quality checks.",
  "Enable Cloudinary uploads for product galleries and storefront banners.",
  "Route orders into the vendor dashboard with fulfillment expectations.",
] as const;

export const buildPhases: BuildPhase[] = [
  {
    id: "phase-1",
    step: "Phase 1",
    title: "Manual order capture",
    status: "done",
    description:
      "Launch the storefront, vendor pages, and a manual order-request flow before online payments exist.",
    deliverables: [
      "Customer order-request page",
      "MongoDB persistence for order inquiries",
      "Admin visibility into new order requests",
    ],
  },
  {
    id: "phase-2",
    step: "Phase 2",
    title: "Catalog operations",
    status: "done",
    description:
      "Give vendors and admins the ability to create, review, and publish products from the dashboard into the live storefront.",
    deliverables: [
      "Vendor product CRUD",
      "Cloudinary image uploads from dashboard forms",
      "Admin approval workflow for new listings",
      "Automatic publishing into the public catalog after approval",
    ],
  },
  {
    id: "phase-3",
    step: "Phase 3",
    title: "Cart and checkout",
    status: "done",
    description:
      "Cart, quote flows, order tracking, and signed session auth are all live. Payment provider integration is deferred until a payment method is configured.",
    deliverables: [
      "Cart state and checkout summary",
      "Manual cart quote requests before payments",
      "Customer order tracking by request ID",
      "Signed vendor/admin access to protected workspaces",
      "Payment provider integration (deferred — configure when ready)",
    ],
  },
  {
    id: "phase-4",
    step: "Phase 4",
    title: "Marketplace scale-up",
    status: "active",
    description:
      "Turning the MVP into a full operational marketplace: payouts, notifications, analytics, and customer reviews are now live.",
    deliverables: [
      "Vendor payouts and commission tracking",
      "In-app notification bell with MongoDB-backed feed",
      "Admin analytics dashboard with revenue and seller breakdown",
      "Customer review system with star ratings on product pages",
    ],
  },
] as const;

export const vendors: Vendor[] = [
  {
    id: "vendor-aurora",
    slug: "aurora-labs",
    name: "Aurora Labs",
    headline: "Connected home gear with calm, premium industrial design.",
    location: "Kigali, Rwanda",
    responseTime: "Replies in 1h",
    rating: 4.9,
    reviewCount: 124,
    accent: "#e45a36",
    coverImage:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    logoMark: "AL",
    categories: ["Home Control", "Audio"],
    activeProducts: 18,
    fulfillmentRate: "98.6%",
    joined: "2024",
  },
  {
    id: "vendor-signal",
    slug: "signal-mobile",
    name: "Signal Mobile",
    headline: "Fast-moving mobile accessories built for everyday reliability.",
    location: "Nairobi, Kenya",
    responseTime: "Replies in 2h",
    rating: 4.8,
    reviewCount: 211,
    accent: "#1a7b70",
    coverImage:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
    logoMark: "SM",
    categories: ["Mobile Essentials", "Wearables"],
    activeProducts: 27,
    fulfillmentRate: "97.2%",
    joined: "2023",
  },
  {
    id: "vendor-pixel",
    slug: "pixel-foundry",
    name: "Pixel Foundry",
    headline: "Creator tools and desk tech that feel sharp on camera and in use.",
    location: "Lagos, Nigeria",
    responseTime: "Replies in 45m",
    rating: 5,
    reviewCount: 86,
    accent: "#11211c",
    coverImage:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    logoMark: "PF",
    categories: ["Creator Gear", "Desk Setup"],
    activeProducts: 15,
    fulfillmentRate: "99.1%",
    joined: "2025",
  },
  {
    id: "vendor-orbit",
    slug: "orbit-play",
    name: "Orbit Play",
    headline: "Gaming and entertainment drops for buyers who want personality.",
    location: "Cape Town, South Africa",
    responseTime: "Replies in 3h",
    rating: 4.7,
    reviewCount: 173,
    accent: "#f2bf63",
    coverImage:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
    logoMark: "OP",
    categories: ["Gaming", "Creator Gear"],
    activeProducts: 21,
    fulfillmentRate: "96.4%",
    joined: "2022",
  },
];

export const products: Product[] = [
  {
    id: "product-hub",
    slug: "aurora-smart-hub",
    vendorSlug: "aurora-labs",
    name: "Aurora Smart Hub",
    category: "Home Control",
    badge: "Best seller",
    description:
      "A Matter-ready smart home hub with local automation, room scenes, and energy snapshots.",
    price: 189,
    compareAt: 229,
    rating: 4.9,
    reviewCount: 82,
    stockLabel: "In stock",
    shipWindow: "Ships within 24h",
    accent: "#e45a36",
    heroImage:
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
    ],
    features: ["Matter + Thread support", "Automation scenes", "Energy analytics"],
    featured: true,
  },
  {
    id: "product-buds",
    slug: "signal-noise-buds",
    vendorSlug: "signal-mobile",
    name: "Signal Noise Buds",
    category: "Mobile Essentials",
    badge: "Fast mover",
    description:
      "Compact wireless earbuds with strong battery life, low-latency mode, and quick pairing.",
    price: 79,
    compareAt: 99,
    rating: 4.8,
    reviewCount: 143,
    stockLabel: "Low stock",
    shipWindow: "Ships within 48h",
    accent: "#1a7b70",
    heroImage:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=1200&q=80",
    ],
    features: ["Low latency mode", "Quick charge case", "Dual-device switch"],
    featured: true,
  },
  {
    id: "product-arm",
    slug: "pixel-monitor-arm",
    vendorSlug: "pixel-foundry",
    name: "Pixel Monitor Arm",
    category: "Creator Gear",
    badge: "Editor pick",
    description:
      "A studio-grade monitor arm with clean cable routing and fast-adjust tension control.",
    price: 129,
    rating: 4.9,
    reviewCount: 51,
    stockLabel: "In stock",
    shipWindow: "Ships within 24h",
    accent: "#11211c",
    heroImage:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
    ],
    features: ["Hidden cable channel", "Tool-free tilt", "Desk clamp + grommet mount"],
    featured: true,
  },
  {
    id: "product-stand",
    slug: "orbit-controller-stand",
    vendorSlug: "orbit-play",
    name: "Orbit Controller Stand",
    category: "Gaming",
    badge: "New drop",
    description:
      "A sculpted display stand with charging passthrough for premium gaming setups.",
    price: 59,
    rating: 4.7,
    reviewCount: 34,
    stockLabel: "In stock",
    shipWindow: "Ships within 72h",
    accent: "#f2bf63",
    heroImage:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1603481546579-65d935ba9cdd?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=1200&q=80",
    ],
    features: ["USB-C passthrough", "Weighted base", "Fits modern controllers"],
    featured: true,
  },
  {
    id: "product-charger",
    slug: "signal-magnetic-charger",
    vendorSlug: "signal-mobile",
    name: "Signal Magnetic Charger",
    category: "Mobile Essentials",
    badge: "Everyday pick",
    description:
      "A slim magnetic stand charger with folded travel mode and dual-angle positioning.",
    price: 49,
    rating: 4.6,
    reviewCount: 67,
    stockLabel: "In stock",
    shipWindow: "Ships tomorrow",
    accent: "#1a7b70",
    heroImage:
      "https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1603539444875-76e7684265f3?auto=format&fit=crop&w=1200&q=80",
    ],
    features: ["Fast wireless charge", "Fold-flat travel mode", "Portrait or landscape"],
  },
  {
    id: "product-strip",
    slug: "aurora-light-strip",
    vendorSlug: "aurora-labs",
    name: "Aurora Light Strip",
    category: "Home Control",
    badge: "Scene-ready",
    description:
      "A room-defining RGB light strip with segment control, automation triggers, and voice support.",
    price: 69,
    compareAt: 89,
    rating: 4.8,
    reviewCount: 58,
    stockLabel: "In stock",
    shipWindow: "Ships within 24h",
    accent: "#e45a36",
    heroImage:
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80",
    ],
    features: ["Segment control", "Matter scene sync", "Warm-to-neon range"],
  },
  {
    id: "product-dock",
    slug: "pixel-creator-dock",
    vendorSlug: "pixel-foundry",
    name: "Pixel Creator Dock",
    category: "Creator Gear",
    badge: "Desk hero",
    description:
      "A seven-port desktop dock for creators who want fewer dongles and cleaner desks.",
    price: 149,
    rating: 4.9,
    reviewCount: 47,
    stockLabel: "In stock",
    shipWindow: "Ships within 24h",
    accent: "#11211c",
    heroImage:
      "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    ],
    features: ["7 ports", "4K display output", "Single-cable desk setup"],
  },
];

export const vendorDashboardHighlights = [
  { label: "Open orders", value: "16" },
  { label: "Gross sales", value: "$8.4K" },
  { label: "Payout status", value: "Queued Friday" },
] as const;

export const vendorOrders = [
  {
    id: "ORD-1083",
    buyer: "Arielle N.",
    item: "Aurora Smart Hub",
    status: "Packing",
    total: "$189",
  },
  {
    id: "ORD-1081",
    buyer: "Josue K.",
    item: "Aurora Light Strip",
    status: "Label created",
    total: "$69",
  },
  {
    id: "ORD-1076",
    buyer: "Nadine M.",
    item: "Signal Noise Buds",
    status: "Awaiting pickup",
    total: "$79",
  },
] as const;

export const adminQueue = [
  {
    name: "Nova Circuit",
    category: "Wearables",
    stage: "Compliance review",
    eta: "Today",
  },
  {
    name: "Render Nest",
    category: "Creator Gear",
    stage: "Catalog QA",
    eta: "Tomorrow",
  },
  {
    name: "Halo Supply",
    category: "Home Control",
    stage: "Payout setup",
    eta: "Friday",
  },
] as const;

export function getVendorBySlug(slug: string) {
  return vendors.find((vendor) => vendor.slug === slug);
}

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getVendorProducts(vendorSlug: string) {
  return products.filter((product) => product.vendorSlug === vendorSlug);
}

export function getFeaturedProducts() {
  return products.filter((product) => product.featured);
}

export function getTopVendors() {
  return vendors.slice(0, 3);
}
