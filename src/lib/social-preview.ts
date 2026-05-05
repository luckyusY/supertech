const CLOUDINARY_UPLOAD_SEGMENT = "/image/upload/";

export function getCrawlerSafeImageUrl(imageUrl: string) {
  if (!imageUrl.includes("res.cloudinary.com") || !imageUrl.includes(CLOUDINARY_UPLOAD_SEGMENT)) {
    return imageUrl;
  }

  const [prefix, suffix] = imageUrl.split(CLOUDINARY_UPLOAD_SEGMENT);

  if (!prefix || !suffix) {
    return imageUrl;
  }

  return `${prefix}${CLOUDINARY_UPLOAD_SEGMENT}f_jpg,q_auto,w_1200,h_630,c_fill/${suffix}`;
}
