export const resolveMediaBaseUrl = (): string => {
  const configuredMediaUrl = import.meta.env.VITE_MEDIA_URL?.trim();

  if (configuredMediaUrl) {
    return configuredMediaUrl.replace(/\/$/, "");
  }

  const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

  if (configuredApiUrl && configuredApiUrl !== "/api") {
    try {
      return new URL(configuredApiUrl, window.location.origin).origin;
    } catch {
      return window.location.origin;
    }
  }

  return window.location.origin;
};
