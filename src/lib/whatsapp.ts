export const DEFAULT_VENDOR_WHATSAPP_NUMBER = "+250783998231";

export function resolveWhatsAppNumber(number?: string | null) {
  const trimmed = number?.trim();

  return trimmed || DEFAULT_VENDOR_WHATSAPP_NUMBER;
}

export function getWhatsAppHref(number: string | undefined, message: string) {
  const digits = resolveWhatsAppNumber(number).replace(/[^\d]/g, "");

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
