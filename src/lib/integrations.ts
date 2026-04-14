export type IntegrationStatus = {
  mongodb: {
    configured: boolean;
    label: string;
  };
  cloudinaryServer: {
    configured: boolean;
    label: string;
  };
  cloudinaryClient: {
    configured: boolean;
    label: string;
  };
};

function hasValue(value?: string) {
  return Boolean(value?.trim());
}

export function hasMongoConfig() {
  return hasValue(process.env.MONGODB_URI);
}

export function hasCloudinaryServerConfig() {
  return (
    hasValue(process.env.CLOUDINARY_CLOUD_NAME) &&
    hasValue(process.env.CLOUDINARY_API_KEY) &&
    hasValue(process.env.CLOUDINARY_API_SECRET)
  );
}

export function hasCloudinaryClientConfig() {
  return (
    hasValue(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) &&
    hasValue(process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY)
  );
}

export function getIntegrationStatus(): IntegrationStatus {
  const mongoConfigured = hasMongoConfig();
  const cloudinaryServerConfigured = hasCloudinaryServerConfig();
  const cloudinaryClientConfigured = hasCloudinaryClientConfig();

  return {
    mongodb: {
      configured: mongoConfigured,
      label: mongoConfigured
        ? "MongoDB is configured for Atlas or your hosted cluster."
        : "Add MONGODB_URI and MONGODB_DB to connect products, vendors, and orders.",
    },
    cloudinaryServer: {
      configured: cloudinaryServerConfigured,
      label: cloudinaryServerConfigured
        ? "Cloudinary server credentials are ready for signed uploads."
        : "Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    },
    cloudinaryClient: {
      configured: cloudinaryClientConfigured,
      label: cloudinaryClientConfigured
        ? "Client-side Cloudinary uploads and delivery are ready for vendor workflows."
        : "Expose NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_API_KEY.",
    },
  };
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
