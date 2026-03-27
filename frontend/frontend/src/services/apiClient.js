import logger from "../utils/logger";

const DEFAULT_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

async function request(path, options = {}) {
  const url = `${DEFAULT_BASE_URL}${path}`;
  const startedAt = performance.now();

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const payload = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const error = new Error(`API request failed: ${response.status}`);
      error.status = response.status;
      error.payload = payload;
      logger.error("API request failed", {
        path,
        status: response.status,
        payload,
      });
      throw error;
    }

    if (import.meta.env.DEV) {
      logger.info("API request completed", {
        endpoint: path,
        durationMs: Number((performance.now() - startedAt).toFixed(2)),
        status: response.status,
      });
    }

    return payload;
  } catch (error) {
    if (import.meta.env.DEV) {
      logger.warn("API request timing", {
        endpoint: path,
        durationMs: Number((performance.now() - startedAt).toFixed(2)),
        status: error?.status ?? "NETWORK_ERROR",
      });
    }

    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown API error");
  }
}

const apiClient = {
  get(path, options = {}) {
    return request(path, { method: "GET", ...options });
  },
};

export default apiClient;
