import type { Vendor } from "@/lib/marketplace";

// Default MTN MoMoPay merchant details applied to every vendor until they
// replace it with their own merchant code from the dashboard.
export const DEFAULT_MOMO_MERCHANT_CODE = "1135306";
export const DEFAULT_MOMO_BUSINESS_NAME = "COGOMA LTD";

// Standard MTN MoMoPay merchant USSD prefix. Full dial string is
// *182*8*1*<merchantCode>#
export const MOMO_USSD_PREFIX = "*182*8*1*";

export type VendorMomoPayment = {
  merchantCode: string;
  businessName: string;
  ussdPrefix: string;
  dialCode: string;
};

export function getMomoDialCode(merchantCode: string) {
  return `${MOMO_USSD_PREFIX}${merchantCode}#`;
}

export function resolveVendorMomo(
  vendor?: Pick<Vendor, "momoMerchantCode" | "momoBusinessName" | "name"> | null,
): VendorMomoPayment {
  const merchantCode =
    vendor?.momoMerchantCode?.trim() || DEFAULT_MOMO_MERCHANT_CODE;
  const businessName =
    vendor?.momoBusinessName?.trim() ||
    DEFAULT_MOMO_BUSINESS_NAME;

  return {
    merchantCode,
    businessName,
    ussdPrefix: MOMO_USSD_PREFIX,
    dialCode: getMomoDialCode(merchantCode),
  };
}
