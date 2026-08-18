const { API_HEADERS } = require("./headers");
const { decryptJson } = require("./crypto");

const BASE_URL = "https://nakanime.tv";

async function nakanimeApi(path, options = {}) {
  const method = options.method || "GET";
  const headers = { ...API_HEADERS, ...(options.headers || {}) };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    const errorBody = contentType.includes("octet-stream")
      ? decryptJson(path, await response.arrayBuffer())
      : await response.json().catch(() => ({}));
    const message = errorBody.message || errorBody.error || `HTTP ${response.status}`;
    throw new Error(message);
  }

  if (contentType.includes("octet-stream") || response.headers.get("x-enc") === "1") {
    return decryptJson(path, await response.arrayBuffer());
  }

  return response.json();
}

module.exports = { BASE_URL, nakanimeApi };
