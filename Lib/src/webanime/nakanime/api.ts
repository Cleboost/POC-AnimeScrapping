import { NAKANIME_API_HEADERS } from "../shared/headers.js";
import { decryptJson } from "./crypto.js";

export const NAKANIME_BASE_URL = "https://nakanime.tv";

interface NakanimeApiOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
}

export async function nakanimeApi<T>(path: string, options: NakanimeApiOptions = {}): Promise<T> {
  const method = options.method ?? "GET";
  const headers: Record<string, string> = { ...NAKANIME_API_HEADERS, ...options.headers };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${NAKANIME_BASE_URL}${path}`, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok) {
    const errorBody = contentType.includes("octet-stream")
      ? await decryptJson<{ message?: string; error?: string }>(path, await response.arrayBuffer())
      : await response.json().catch(() => ({} as { message?: string; error?: string }));
    const message = errorBody.message ?? errorBody.error ?? `HTTP ${response.status}`;
    throw new Error(message);
  }

  if (contentType.includes("octet-stream") || response.headers.get("x-enc") === "1") {
    return decryptJson<T>(path, await response.arrayBuffer());
  }

  return response.json() as Promise<T>;
}
