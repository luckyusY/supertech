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
  { label: "Verified sellers", value: "7" },
  { label: "Products listed", value: "31" },
  { label: "Cities served", value: "12+" },
] as const;

export const categoryHighlights = [
  {
    name: "Home Control",
    count: 5,
    accent: "linear-gradient(90deg, #e45a36, #f2bf63)",
    description:
      "Smart hubs, sensors, light strips, and mesh routers for a seamlessly connected home.",
  },
  {
    name: "Mobile Essentials",
    count: 4,
    accent: "linear-gradient(90deg, #1a7b70, #7ad0bf)",
    description:
      "Charging, cases, and everyday carry gear that keeps you moving faster.",
  },
  {
    name: "Creator Gear",
    count: 4,
    accent: "linear-gradient(90deg, #11211c, #45695b)",
    description:
      "Monitors, keyboards, docks, and desk lights built for your best work.",
  },
  {
    name: "Gaming",
    count: 4,
    accent: "linear-gradient(90deg, #f2bf63, #e45a36)",
    description:
      "Controllers, headsets, RGB pads, and stands for setups with personality.",
  },
  {
    name: "Audio",
    count: 4,
    accent: "linear-gradient(90deg, #5b3a8c, #9b6fd4)",
    description:
      "Studio headphones, portable speakers, and DAC amps for serious listening.",
  },
  {
    name: "Wearables",
    count: 3,
    accent: "linear-gradient(90deg, #1a5c7b, #4ab0d4)",
    description:
      "Smartwatches and fitness bands that track what matters most to you.",
  },
  {
    name: "Beauty & Personal Care",
    count: 4,
    accent: "linear-gradient(90deg, #c14f7a, #f1a6c3)",
    description:
      "Serums, cleansers, sunscreen, and glow-focused essentials for daily routines.",
  },
  {
    name: "Health & Wellness",
    count: 3,
    accent: "linear-gradient(90deg, #3e8f68, #9ad7b6)",
    description:
      "Recovery, sleep, and wellness picks that balance everyday performance.",
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
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80",
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
      "https://images.unsplash.com/photo-1593640408182-31c228eed6e5?auto=format&fit=crop&w=1200&q=80",
    logoMark: "PF",
    categories: ["Creator Gear", "Desk Setup"],
    activeProducts: 15,
    fulfillmentRate: "99.1%",
    joined: "2025",
  },
  {
    id: "vendor-luna",
    slug: "luna-beauty",
    name: "Luna Beauty",
    headline: "Beauty and wellness essentials with premium formulations and clean packaging.",
    location: "Kampala, Uganda",
    responseTime: "Replies in 50m",
    rating: 4.8,
    reviewCount: 132,
    accent: "#c14f7a",
    coverImage:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
    logoMark: "LB",
    categories: ["Beauty & Personal Care", "Health & Wellness"],
    activeProducts: 14,
    fulfillmentRate: "98.9%",
    joined: "2024",
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
  {
    id: "vendor-wave",
    slug: "wave-audio",
    name: "Wave Audio",
    headline: "Studio-grade audio for everyday listeners and serious audiophiles.",
    location: "Accra, Ghana",
    responseTime: "Replies in 1h",
    rating: 4.9,
    reviewCount: 98,
    accent: "#5b3a8c",
    coverImage:
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80",
    logoMark: "WA",
    categories: ["Audio"],
    activeProducts: 12,
    fulfillmentRate: "98.2%",
    joined: "2024",
  },
  {
    id: "vendor-flex",
    slug: "flex-wearables",
    name: "Flex Wearables",
    headline: "Smart fitness gear that works as hard as you do.",
    location: "Kampala, Uganda",
    responseTime: "Replies in 2h",
    rating: 4.6,
    reviewCount: 145,
    accent: "#1a5c7b",
    coverImage:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
    logoMark: "FW",
    categories: ["Wearables"],
    activeProducts: 9,
    fulfillmentRate: "97.8%",
    joined: "2024",
  },
];

export const products: Product[] = [
  // ── Aurora Labs · Home Control ──────────────────────────────────────
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
    id: "product-strip",
    slug: "aurora-light-strip",
    vendorSlug: "aurora-labs",
    name: "Aurora Light Strip",
    category: "Home Control",
    badge: "Scene-ready",
    description:
      "A room-defining RGBIC light strip with segment control, automation triggers, and voice support.",
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
    featured: true,
  },
  {
    id: "product-sensor",
    slug: "aurora-smart-sensor",
    vendorSlug: "aurora-labs",
    name: "Aurora Motion Sensor",
    category: "Home Control",
    badge: "New drop",
    description:
      "A compact motion and temperature sensor that triggers automations instantly, no cloud required.",
    price: 45,
    rating: 4.7,
    reviewCount: 31,
    stockLabel: "In stock",
    shipWindow: "Ships within 24h",
    accent: "#e45a36",
    heroImage:
      "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    ],
    features: ["Thread protocol", "Local processing", "2-year battery"],
  },
  {
    id: "product-plug",
    slug: "aurora-smart-plug",
    vendorSlug: "aurora-labs",
    name: "Aurora Smart Plug",
    category: "Home Control",
    badge: "Value pick",
    description:
      "A Matter-compatible smart plug with energy monitoring. Control any device from the Aurora app.",
    price: 29,
    rating: 4.6,
    reviewCount: 44,
    stockLabel: "In stock",
    shipWindow: "Ships tomorrow",
    accent: "#e45a36",
    heroImage:
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    ],
    features: ["Energy monitoring", "Voice control", "Matter compatible"],
  },
  {
    id: "product-mesh",
    slug: "aurora-mesh-router",
    vendorSlug: "aurora-labs",
    name: "Aurora Mesh Node",
    category: "Home Control",
    badge: "Wi-Fi 6E",
    description:
      "A single mesh node that extends your Wi-Fi 6E network with seamless handoff and zero dead zones.",
    price: 129,
    compareAt: 159,
    rating: 4.8,
    reviewCount: 27,
    stockLabel: "In stock",
    shipWindow: "Ships within 48h",
    accent: "#e45a36",
    heroImage:
      "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    ],
    features: ["Wi-Fi 6E", "Seamless roaming", "Matter hub built-in"],
  },
  // ── Signal Mobile · Mobile Essentials ──────────────────────────────
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
    id: "product-powerbank",
    slug: "signal-power-bank",
    vendorSlug: "signal-mobile",
    name: "Signal Power Bank 20K",
    category: "Mobile Essentials",
    badge: "Travel essential",
    description:
      "A 20,000mAh slim power bank with 65W USB-C PD and dual device charging for long trips.",
    price: 65,
    compareAt: 79,
    rating: 4.7,
    reviewCount: 89,
    stockLabel: "In stock",
    shipWindow: "Ships within 24h",
    accent: "#1a7b70",
    heroImage:
      "https://images.unsplash.com/photo-1609592806510-40ca98d6e9e5?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1609592806510-40ca98d6e9e5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
    ],
    features: ["65W USB-C PD", "20,000 mAh", "Dual simultaneous charge"],
  },
  {
    id: "product-carmount",
    slug: "signal-car-mount",
    vendorSlug: "signal-mobile",
    name: "Signal Car Mount",
    category: "Mobile Essentials",
    badge: "Driver pick",
    description:
      "A wireless charging car mount with one-hand grip release and 15W fast charge.",
    price: 39,
    rating: 4.5,
    reviewCount: 52,
    stockLabel: "In stock",
    shipWindow: "Ships tomorrow",
    accent: "#1a7b70",
    heroImage:
      "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
    ],
    features: ["15W wireless", "One-grip release", "Vent + dash mount"],
  },
  // ── Pixel Foundry · Creator Gear ────────────────────────────────────
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
  {
    id: "product-keyboard",
    slug: "pixel-mechanical-keyboard",
    vendorSlug: "pixel-foundry",
    name: "Pixel Mech Keyboard",
    category: "Creator Gear",
    badge: "Type better",
    description:
      "A compact 75% wireless mechanical keyboard with hot-swap sockets, per-key RGB, and aluminum case.",
    price: 199,
    compareAt: 239,
    rating: 4.8,
    reviewCount: 63,
    stockLabel: "In stock",
    shipWindow: "Ships within 48h",
    accent: "#11211c",
    heroImage:
      "https://images.unsplash.com/photo-1593640408182-31c228eed6e5?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1593640408182-31c228eed6e5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1541140532154-b024d705b90a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    ],
    features: ["Hot-swap sockets", "Tri-mode wireless", "Aluminum CNC case"],
    featured: true,
  },
  {
    id: "product-lamp",
    slug: "pixel-desk-lamp",
    vendorSlug: "pixel-foundry",
    name: "Pixel Monitor Light Bar",
    category: "Creator Gear",
    badge: "Zero glare",
    description:
      "A clip-on monitor light bar with asymmetric lighting that illuminates your desk without screen glare.",
    price: 79,
    rating: 4.7,
    reviewCount: 38,
    stockLabel: "In stock",
    shipWindow: "Ships tomorrow",
    accent: "#11211c",
    heroImage:
      "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    ],
    features: ["Zero screen glare", "Touch dimmer", "USB-C powered"],
  },
  // ── Orbit Play · Gaming ──────────────────────────────────────────────
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
  },
  {
    id: "product-headset",
    slug: "orbit-gaming-headset",
    vendorSlug: "orbit-play",
    name: "Orbit Wireless Headset",
    category: "Gaming",
    badge: "Clear comms",
    description:
      "A 2.4GHz wireless gaming headset with 50mm drivers, detachable mic, and 24h battery.",
    price: 119,
    compareAt: 149,
    rating: 4.6,
    reviewCount: 71,
    stockLabel: "In stock",
    shipWindow: "Ships within 48h",
    accent: "#f2bf63",
    heroImage:
      "https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
    ],
    features: ["2.4GHz wireless", "50mm drivers", "24h battery life"],
    featured: true,
  },
  {
    id: "product-mousepad",
    slug: "orbit-rgb-mousepad",
    vendorSlug: "orbit-play",
    name: "Orbit XXL RGB Pad",
    category: "Gaming",
    badge: "Desk cover",
    description:
      "A full-desk XXL mousepad with addressable RGB edge lighting and smooth micro-weave surface.",
    price: 45,
    rating: 4.8,
    reviewCount: 56,
    stockLabel: "In stock",
    shipWindow: "Ships within 48h",
    accent: "#f2bf63",
    heroImage:
      "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1603481546579-65d935ba9cdd?auto=format&fit=crop&w=1200&q=80",
    ],
    features: ["900×400mm surface", "14 RGB zones", "Anti-slip base"],
  },
  {
    id: "product-chair",
    slug: "orbit-gaming-chair",
    vendorSlug: "orbit-play",
    name: "Orbit Ergo Chair",
    category: "Gaming",
    badge: "Posture-first",
    description:
      "An ergonomic mesh gaming chair with lumbar support, 4D armrests, and 135° recline.",
    price: 299,
    compareAt: 379,
    rating: 4.5,
    reviewCount: 29,
    stockLabel: "Limited stock",
    shipWindow: "Ships within 5–7 days",
    accent: "#f2bf63",
    heroImage:
      "https://images.unsplash.com/photo-1666397830751-74aa62f51be4?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1666397830751-74aa62f51be4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1603481546579-65d935ba9cdd?auto=format&fit=crop&w=1200&q=80",
    ],
    features: ["4D armrests", "135° recline", "Breathable mesh back"],
  },
  // ── Wave Audio · Audio ──────────────────────────────────────────────
  {
    id: "product-headphones",
    slug: "wave-studio-headphones",
    vendorSlug: "wave-audio",
    name: "Wave Studio Pro",
    category: "Audio",
    badge: "Audiophile",
    description:
      "Closed-back studio headphones with 40mm beryllium-coated drivers and a detachable cable.",
    price: 249,
    compareAt: 299,
    rating: 4.9,
    reviewCount: 42,
    stockLabel: "In stock",
    shipWindow: "Ships within 24h",
    accent: "#5b3a8c",
    heroImage:
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80",
    ],
    features: ["40mm beryllium drivers", "Closed-back isolation", "Detachable cable"],
    featured: true,
  },
  {
    id: "product-speaker",
    slug: "wave-bt-speaker",
    vendorSlug: "wave-audio",
    name: "Wave BT Speaker",
    category: "Audio",
    badge: "360° sound",
    description:
      "A compact 360° Bluetooth speaker with 24h battery, IP67 waterproofing, and dual-pairing.",
    price: 89,
    compareAt: 109,
    rating: 4.7,
    reviewCount: 88,
    stockLabel: "In stock",
    shipWindow: "Ships tomorrow",
    accent: "#5b3a8c",
    heroImage:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
    ],
    features: ["360° omnidirectional", "IP67 waterproof", "Dual stereo pairing"],
  },
  {
    id: "product-dac",
    slug: "wave-dac-amp",
    vendorSlug: "wave-audio",
    name: "Wave DAC + Amp",
    category: "Audio",
    badge: "Pure signal",
    description:
      "A desktop DAC and headphone amplifier with balanced 4.4mm output and 32-bit/384kHz decoding.",
    price: 179,
    rating: 4.8,
    reviewCount: 33,
    stockLabel: "In stock",
    shipWindow: "Ships within 48h",
    accent: "#5b3a8c",
    heroImage:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
    ],
    features: ["32-bit/384kHz", "Balanced 4.4mm out", "USB-C + optical input"],
  },
  {
    id: "product-earbuds2",
    slug: "wave-sport-earbuds",
    vendorSlug: "wave-audio",
    name: "Wave Sport Earbuds",
    category: "Audio",
    badge: "Gym-ready",
    description:
      "IPX5 sport earbuds with ANC, 9-hour battery, and an ear-hook design that never falls out.",
    price: 99,
    compareAt: 129,
    rating: 4.6,
    reviewCount: 61,
    stockLabel: "In stock",
    shipWindow: "Ships tomorrow",
    accent: "#5b3a8c",
    heroImage:
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80",
    ],
    features: ["IPX5 sweat-proof", "Active noise cancel", "Ear-hook secure fit"],
  },
  // ── Flex Wearables · Wearables ──────────────────────────────────────
  {
    id: "product-watch",
    slug: "flex-smart-watch",
    vendorSlug: "flex-wearables",
    name: "Flex Smart Watch",
    category: "Wearables",
    badge: "Always-on",
    description:
      "A slim AMOLED smartwatch with GPS, SpO2, heart rate, and 10-day battery for daily wear.",
    price: 229,
    compareAt: 279,
    rating: 4.8,
    reviewCount: 94,
    stockLabel: "In stock",
    shipWindow: "Ships within 24h",
    accent: "#1a5c7b",
    heroImage:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1200&q=80",
    ],
    features: ["AMOLED always-on display", "GPS + SpO2", "10-day battery"],
    featured: true,
  },
  {
    id: "product-band",
    slug: "flex-fitness-band",
    vendorSlug: "flex-wearables",
    name: "Flex Fitness Band",
    category: "Wearables",
    badge: "Entry level",
    description:
      "A lightweight fitness band with step counting, sleep tracking, and 14-day battery life.",
    price: 49,
    rating: 4.5,
    reviewCount: 112,
    stockLabel: "In stock",
    shipWindow: "Ships tomorrow",
    accent: "#1a5c7b",
    heroImage:
      "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1200&q=80",
    ],
    features: ["Step + sleep tracking", "14-day battery", "Water resistant"],
  },
  {
    id: "product-swatch",
    slug: "flex-sport-watch",
    vendorSlug: "flex-wearables",
    name: "Flex Sport Watch",
    category: "Wearables",
    badge: "Rugged",
    description:
      "A MIL-STD-810 rated sport watch with built-in compass, altimeter, and 20-day battery.",
    price: 179,
    compareAt: 219,
    rating: 4.7,
    reviewCount: 48,
    stockLabel: "In stock",
    shipWindow: "Ships within 48h",
    accent: "#1a5c7b",
    heroImage:
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?auto=format&fit=crop&w=1200&q=80",
    ],
    features: ["MIL-STD-810 rated", "Compass + altimeter", "20-day battery"],
  },
  // Luna Beauty · Beauty & Personal Care / Health & Wellness
  {
    id: "product-serum",
    slug: "luna-vitamin-c-serum",
    vendorSlug: "luna-beauty",
    name: "Luna Vitamin C Serum",
    category: "Beauty & Personal Care",
    badge: "Glow boost",
    description:
      "A brightening serum with vitamin C, niacinamide, and hyaluronic acid for daily radiance.",
    price: 34,
    compareAt: 42,
    rating: 4.8,
    reviewCount: 76,
    stockLabel: "In stock",
    shipWindow: "Ships within 24h",
    accent: "#c14f7a",
    heroImage:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
    ],
    features: ["Vitamin C + niacinamide", "Brightens and hydrates", "Lightweight daily finish"],
    featured: true,
  },
  {
    id: "product-cleanser",
    slug: "luna-hydration-cleanser",
    vendorSlug: "luna-beauty",
    name: "Luna Hydration Cleanser",
    category: "Beauty & Personal Care",
    badge: "Daily routine",
    description:
      "A gentle gel cleanser that removes buildup without stripping the skin barrier.",
    price: 18,
    compareAt: 24,
    rating: 4.7,
    reviewCount: 64,
    stockLabel: "In stock",
    shipWindow: "Ships tomorrow",
    accent: "#c14f7a",
    heroImage:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
    ],
    features: ["Low-foam gel texture", "Barrier-friendly cleanse", "Suitable for daily use"],
  },
  {
    id: "product-night-cream",
    slug: "luna-repair-night-cream",
    vendorSlug: "luna-beauty",
    name: "Luna Repair Night Cream",
    category: "Beauty & Personal Care",
    badge: "Overnight care",
    description:
      "A repair cream with ceramides and peptides that seals in moisture overnight.",
    price: 29,
    compareAt: 36,
    rating: 4.9,
    reviewCount: 58,
    stockLabel: "In stock",
    shipWindow: "Ships within 24h",
    accent: "#c14f7a",
    heroImage:
      "https://images.unsplash.com/photo-1619451334792-150fd785ee74?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1619451334792-150fd785ee74?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80",
    ],
    features: ["Ceramide repair complex", "Peptide support", "Rich overnight texture"],
  },
  {
    id: "product-sunscreen",
    slug: "luna-mineral-sunscreen",
    vendorSlug: "luna-beauty",
    name: "Luna Mineral Sunscreen SPF 50",
    category: "Beauty & Personal Care",
    badge: "SPF daily",
    description:
      "A lightweight mineral sunscreen with SPF 50 and a non-greasy finish for everyday wear.",
    price: 26,
    compareAt: 32,
    rating: 4.7,
    reviewCount: 71,
    stockLabel: "In stock",
    shipWindow: "Ships tomorrow",
    accent: "#c14f7a",
    heroImage:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1619451334792-150fd785ee74?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1200&q=80",
    ],
    features: ["SPF 50 mineral filter", "No white cast finish", "Everyday protection"],
  },
  {
    id: "product-gummies",
    slug: "luna-collagen-gummies",
    vendorSlug: "luna-beauty",
    name: "Luna Collagen Gummies",
    category: "Health & Wellness",
    badge: "Beauty from within",
    description:
      "Daily collagen gummies with biotin and vitamin E to support skin, hair, and nails.",
    price: 22,
    compareAt: 28,
    rating: 4.6,
    reviewCount: 49,
    stockLabel: "In stock",
    shipWindow: "Ships within 48h",
    accent: "#3e8f68",
    heroImage:
      "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1577174881658-0f30ed549adc?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
    ],
    features: ["Collagen + biotin blend", "30-day supply", "Berry flavor"],
  },
  {
    id: "product-tea",
    slug: "luna-sleep-tea-blend",
    vendorSlug: "luna-beauty",
    name: "Luna Sleep Tea Blend",
    category: "Health & Wellness",
    badge: "Wind down",
    description:
      "A caffeine-free herbal sleep blend with chamomile, lavender, and lemon balm.",
    price: 16,
    rating: 4.7,
    reviewCount: 37,
    stockLabel: "In stock",
    shipWindow: "Ships within 24h",
    accent: "#3e8f68",
    heroImage:
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1577174881658-0f30ed549adc?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=1200&q=80",
    ],
    features: ["Chamomile + lavender", "Caffeine free", "Evening ritual blend"],
  },
  {
    id: "product-recovery-kit",
    slug: "luna-recovery-kit",
    vendorSlug: "luna-beauty",
    name: "Luna Recovery Kit",
    category: "Health & Wellness",
    badge: "Reset kit",
    description:
      "A recovery bundle with aromatherapy roll-on, bath soak, and cooling eye mask.",
    price: 31,
    compareAt: 39,
    rating: 4.8,
    reviewCount: 43,
    stockLabel: "In stock",
    shipWindow: "Ships within 48h",
    accent: "#3e8f68",
    heroImage:
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1577174881658-0f30ed549adc?auto=format&fit=crop&w=1200&q=80",
    ],
    features: ["Aromatherapy roll-on", "Mineral bath soak", "Cooling eye mask"],
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
  return vendors.slice(0, 4);
}

export function getCategories() {
  return [...new Set(products.map((p) => p.category))].sort();
}
