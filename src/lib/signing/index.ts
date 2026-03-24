export function normalizeQuery(params: URLSearchParams) {
  return [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&")
}

export function buildCanonicalString(input: {
  method: string
  path: string
  query: string
  timestamp: string
  bodyHash?: string
}) {
  return [
    input.method.toUpperCase(),
    input.path,
    input.query,
    input.timestamp,
    input.bodyHash ?? ""
  ].join("\n")
}

function bufferToBase64(buffer: ArrayBuffer) {
  let binary = ""
  const bytes = new Uint8Array(buffer)
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}

export async function signCanonicalString(secret: string, canonical: string) {
  const encoder = new TextEncoder()

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(canonical)
  )

  return bufferToBase64(signature)
}
