# SuperTech Marketplace

A multivendor ecommerce starter for `Next.js 16`, `React 19`, `MongoDB`, `Cloudinary`, and `Vercel`.

## What is included

- Premium storefront homepage with category and vendor sections
- Catalog, product detail, vendor directory, and vendor storefront pages
- Vendor dashboard and admin dashboard starter shells
- MongoDB connection helper for Atlas or any compatible cluster
- Cloudinary configuration and signed upload endpoint starter
- `.env.example` with the variables needed for local development and Vercel

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Create a `.env.local` file from `.env.example`.

```bash
cp .env.example .env.local
```

Required for real integrations:

- `MONGODB_URI`
- `MONGODB_DB`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_CLOUDINARY_API_KEY`

## Suggested next steps

1. Add authentication for admins, vendors, and customers.
2. Persist vendors, products, carts, and orders in MongoDB.
3. Connect Cloudinary uploads to the vendor product creation flow.
4. Add cart, checkout, payments, and vendor payout orchestration.
5. Protect dashboard routes with role-based access control before going live.
