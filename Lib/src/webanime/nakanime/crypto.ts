/**
 * Nakanime API responses use x-enc: 1 (application/octet-stream).
 * Payload is XOR-encrypted with a 32-byte key derived from the request path.
 */

const API_SALT = "nkapiv1";

function deriveKey(path: string): number[] {
  const input = API_SALT + path;
  const key: number[] = [];

  for (let round = 0; round < 32; round++) {
    let acc = 0;
    for (let i = 0; i < input.length; i++) {
      acc = (acc * 31 + input.charCodeAt(i) + round) & 0xff;
    }
    key.push(acc);
  }

  return key;
}

function decryptBuffer(path: string, buffer: ArrayBuffer): Uint8Array {
  const bytes = new Uint8Array(buffer);
  const key = deriveKey(path);

  for (let i = 0; i < bytes.length; i++) {
    bytes[i] ^= key[i % key.length];
  }

  return bytes;
}

export function decryptJson<T>(path: string, buffer: ArrayBuffer): T {
  const bytes = decryptBuffer(path, buffer);
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
}
