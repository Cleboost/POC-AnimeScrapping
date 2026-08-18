export async function fetchText(
  url: string,
  options: RequestInit = {},
): Promise<string> {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.text();
}

export async function fetchJson<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.json() as Promise<T>;
}

export async function headOk(url: string, headers: Record<string, string> = {}): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD", headers });
    return response.ok;
  } catch {
    return false;
  }
}
