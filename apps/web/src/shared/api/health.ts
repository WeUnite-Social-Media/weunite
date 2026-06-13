import { resolveApiHealthUrl } from "@/shared/api/http";

export interface ApiHealthResponse {
  status: string;
}

export const checkApiHealth = async () => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch(resolveApiHealthUrl(), {
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error("API health check failed");
    }

    const data = (await response.json()) as ApiHealthResponse;

    if (data.status !== "UP") {
      throw new Error("API is not healthy");
    }

    return data;
  } finally {
    window.clearTimeout(timeoutId);
  }
};
