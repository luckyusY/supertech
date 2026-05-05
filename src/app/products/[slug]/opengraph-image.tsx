import { ImageResponse } from "next/og";
import { getPublicProductBySlug } from "@/lib/public-marketplace";
import { formatPrice } from "@/lib/utils";

/* eslint-disable @next/next/no-img-element */

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

type ProductOpenGraphImageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductOpenGraphImage({
  params,
}: ProductOpenGraphImageProps) {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);

  if (!product) {
    return new ImageResponse(
      (
        <div
          style={{
            alignItems: "center",
            background: "#102019",
            color: "white",
            display: "flex",
            fontFamily: "Arial, sans-serif",
            fontSize: 72,
            fontWeight: 800,
            height: "100%",
            justifyContent: "center",
            width: "100%",
          }}
        >
          SuperTech
        </div>
      ),
      size,
    );
  }

  const imageUrl = product.gallery[0] ?? product.heroImage;

  return new ImageResponse(
    (
      <div
        style={{
          background: "#102019",
          display: "flex",
          height: "100%",
          overflow: "hidden",
          position: "relative",
          width: "100%",
        }}
      >
        <img
          alt=""
          src={imageUrl}
          style={{
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            width: "100%",
          }}
        />
        <div
          style={{
            background:
              "linear-gradient(90deg, rgba(16,32,25,0.96) 0%, rgba(16,32,25,0.76) 45%, rgba(16,32,25,0.2) 100%)",
            display: "flex",
            height: "100%",
            position: "absolute",
            width: "100%",
          }}
        />
        <div
          style={{
            color: "white",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "space-between",
            padding: "70px",
            position: "relative",
            width: "680px",
          }}
        >
          <div
            style={{
              color: "#f2bf63",
              display: "flex",
              fontFamily: "Arial, sans-serif",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            SuperTech Marketplace
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div
              style={{
                display: "flex",
                fontFamily: "Arial, sans-serif",
                fontSize: 76,
                fontWeight: 800,
                lineHeight: 0.95,
              }}
            >
              {product.name}
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.84)",
                display: "flex",
                fontFamily: "Arial, sans-serif",
                fontSize: 30,
                lineHeight: 1.3,
              }}
            >
              {product.category} | {product.stockLabel}
            </div>
          </div>
          <div
            style={{
              alignItems: "center",
              display: "flex",
              gap: 20,
            }}
          >
            <div
              style={{
                background: product.accent,
                borderRadius: 999,
                display: "flex",
                fontFamily: "Arial, sans-serif",
                fontSize: 30,
                fontWeight: 800,
                padding: "18px 26px",
              }}
            >
              {formatPrice(product.price)}
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.78)",
                display: "flex",
                fontFamily: "Arial, sans-serif",
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              {product.badge}
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
